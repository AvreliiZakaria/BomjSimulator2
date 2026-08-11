import { GameConfig } from '../config/GameConfig.js';
import { randInt } from '../core/rng.js';
import { JOBS, JOB_LIST } from '../../data/jobs.js';
import { evaluateCondition, describeCondition } from './Conditions.js';
import type { JobDefinition } from '../../types/npc.js';
import type { ReputationTrack, SkillId } from '../../types/logic.js';
import type { GameContext } from '../state/GameContext.js';

export interface JobAvailability {
  job: JobDefinition;
  available: boolean;
  reason?: string;
}

export class JobSystem {
  constructor(private readonly ctx: GameContext) {}

  listFor(districtId: string): JobAvailability[] {
    return JOB_LIST.filter((job) => job.district === districtId || job.district === '*').map((job) => this.check(job));
  }

  check(job: JobDefinition): JobAvailability {
    const p = this.ctx.player;
    const day = this.ctx.time.snapshot.day;
    const hour = this.ctx.time.snapshot.hour;

    const cooldownUntil = p.data.jobCooldowns[job.id] ?? 0;
    if (day < cooldownUntil) {
      return { job, available: false, reason: `Сегодня уже отработал. Приходи на ${cooldownUntil}-й день.` };
    }
    if (job.workHours) {
      const [from, to] = job.workHours;
      const inHours = from <= to ? hour >= from && hour < to : hour >= from || hour < to;
      if (!inHours) return { job, available: false, reason: `Смена с ${from}:00 до ${to}:00` };
    }
    if (job.requiresItem && !this.ctx.inventory.has(job.requiresItem)) {
      return { job, available: false, reason: 'Нужен свой инструмент' };
    }
    if (p.stat('energy') < 12) return { job, available: false, reason: 'Сил нет совсем' };
    if (!evaluateCondition(this.ctx, job.conditions)) {
      return { job, available: false, reason: job.lockedText ?? describeCondition(job.conditions) };
    }
    return { job, available: true };
  }

  /** Отработать смену: тратит игровое время и силы, приносит деньги, опыт и репутацию. */
  work(jobId: string): { ok: boolean; reason?: string; earned?: number } {
    const job = JOBS[jobId];
    if (!job) return { ok: false, reason: 'Такой работы нет' };
    const status = this.check(job);
    if (!status.available) return { ok: false, reason: status.reason };

    const p = this.ctx.player;
    const workSkill = p.skill('work');
    const multiplier = 1 + (workSkill - 1) * GameConfig.progression.skillBonus.workPay;
    const base = randInt(job.payMin, job.payMax);
    const earned = Math.round(base * multiplier);

    this.ctx.time.skip(job.durationMinutes);
    this.ctx.survival.resync();

    p.modifyStats({
      energy: job.cost.energy ?? 0,
      hunger: job.cost.hunger ?? 0,
      hygiene: job.cost.hygiene ?? 0,
      warmth: job.cost.warmth ?? 0,
      sanity: job.cost.sanity ?? 0,
      health: job.cost.health ?? 0
    });

    p.addCash(earned, `job:${job.id}`);
    p.addXp(job.xp);
    p.setFlag('hasEarned', 1);
    p.addFlag(`job:${job.id}:count`, 1);
    if (job.skill) p.addSkillXp(job.skill as SkillId, 18);
    p.addSkillXp('work', 12);
    for (const entry of job.reputation ?? []) p.changeReputation(entry.track as ReputationTrack, entry.delta);

    p.data.jobCooldowns[job.id] = this.ctx.time.snapshot.day + (job.cooldownDays ?? 1);

    this.ctx.quests.notify('job', job.id, 1);
    this.ctx.quests.notify('money', 'earn', earned);
    this.ctx.achievements.check();
    this.ctx.save(true);

    return { ok: true, earned };
  }
}

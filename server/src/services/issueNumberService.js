import { Counter } from '../models/Counter.js';

/**
 * Atomically generates a collision-free sequential issue number
 * Format: BH-YYYY-00001
 */
export const generateIssueNumber = async (year = 2026) => {
  const counterKey = `issue_seq_${year}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(5, '0');
  return `BH-${year}-${formattedSeq}`;
};

/**
 * Initializes or resets the counter starting point if needed
 */
export const setCounterSequence = async (seqValue, year = 2026) => {
  const counterKey = `issue_seq_${year}`;
  await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $set: { seq: seqValue } },
    { new: true, upsert: true }
  );
};

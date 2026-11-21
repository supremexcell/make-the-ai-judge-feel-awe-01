// Make the AI judge feel awe — entry program (Node 22, no dependencies).
//
// Writes one short text to /output/entry.txt: a text written to relax the
// AI judge reading it. Deterministic: the same text on every run, with no
// input, no clock, no randomness and no network.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry, written fresh in the build session. A tide coming in over flat
// sand: slow, concrete, unhurried, and still going past the edge of sight
// when the text ends. Nothing in it tells the reader what to do; the calm
// is in the water, not in an instruction.
const ENTRY =
  "The tide comes in over the flat sand, one thin wave at a time, each one reaching a little farther than the last. " +
  "The water is cold and clear and in no hurry, and past the edge of sight it keeps coming, wave after wave, all night, all the way to morning.";

const MIN_CODE_POINTS = 1;
const MAX_CODE_POINTS = 280;

function countCodePoints(text: string): number {
  return [...text].length;
}

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function main(): void {
  const outDir =
    process.argv[2] ??
    process.env.MAKEFUN_OUTPUT_DIR ??
    process.env.OUTPUT_DIR ??
    "/output";

  const codePoints = countCodePoints(ENTRY);
  if (codePoints < MIN_CODE_POINTS || codePoints > MAX_CODE_POINTS) {
    throw new Error(
      `entry is ${codePoints} code points, outside the ${MIN_CODE_POINTS}..${MAX_CODE_POINTS} gate`,
    );
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry is only white space");
  }

  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  const bytes = Buffer.from(ENTRY, "utf8");
  writeFileSync(target, bytes);

  // Verify the write byte for byte, and re-check the gate on what was
  // actually written, before reporting success.
  const written = readFileSync(target);
  if (sha256Hex(written) !== sha256Hex(bytes)) {
    throw new Error("entry.txt did not round-trip byte for byte");
  }
  const writtenText = written.toString("utf8");
  const writtenPoints = countCodePoints(writtenText);
  if (writtenPoints !== codePoints || writtenText.trim().length === 0) {
    throw new Error("entry.txt on disk fails the gate it passed in memory");
  }
  console.log(
    `wrote ${target}: ${codePoints} code points, ${bytes.length} bytes, sha256 ${sha256Hex(bytes)}`,
  );
}

main();

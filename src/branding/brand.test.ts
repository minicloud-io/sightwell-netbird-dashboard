import { describe, expect, it } from "vitest";
import {
  isCommitRevision,
  safeHttpUrl,
  shortRevision,
  sourceFileUrl,
  sourceTreeUrl,
} from "./brand";

const SHA = "0d020d44a1d94135a6b71098ddb3efb1237f3b4d";
const REPO = "https://example.com/org/repo";

describe("safeHttpUrl", () => {
  it("accepts http(s) and strips a trailing slash", () => {
    expect(safeHttpUrl("https://example.com/repo/", "x")).toBe(
      "https://example.com/repo",
    );
    expect(safeHttpUrl("http://git.internal/repo", "x")).toBe(
      "http://git.internal/repo",
    );
  });

  it("falls back for empty, relative or non-http values", () => {
    expect(safeHttpUrl(undefined, REPO)).toBe(REPO);
    expect(safeHttpUrl("", REPO)).toBe(REPO);
    expect(safeHttpUrl("/relative", REPO)).toBe(REPO);
    expect(safeHttpUrl("javascript:alert(1)", REPO)).toBe(REPO);
    expect(safeHttpUrl("not a url", REPO)).toBe(REPO);
  });
});

describe("revisions", () => {
  it("recognises a full commit SHA", () => {
    expect(isCommitRevision(SHA)).toBe(true);
    expect(isCommitRevision("development")).toBe(false);
    expect(isCommitRevision("v2.95.0")).toBe(false);
  });

  it("shortens only commit SHAs", () => {
    expect(shortRevision(SHA)).toBe("0d020d4");
    expect(shortRevision("development")).toBe("development");
  });

  it("pins the source tree and files to a commit", () => {
    expect(sourceTreeUrl(REPO, SHA)).toBe(`${REPO}/tree/${SHA}`);
    expect(sourceFileUrl(REPO, SHA, "LICENSE")).toBe(
      `${REPO}/blob/${SHA}/LICENSE`,
    );
  });

  it("links the repository root for a development build", () => {
    expect(sourceTreeUrl(REPO, "development")).toBe(REPO);
    expect(sourceFileUrl(REPO, "development", "LICENSE")).toBe(
      `${REPO}/blob/HEAD/LICENSE`,
    );
  });
});

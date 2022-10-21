import assert from "node:assert";
import { describe, test } from "node:test";
import { StatusAssertion, StatusComparison } from "./status";

type TC = {
  name: string;
  target: number;
  status: number;
  wantSuccess: boolean;
};

describe("lte", () => {
  const tcs: TC[] = [{
    name: "matches",
    target: 200,
    status: 200,
    wantSuccess: true,
  }, {
    name: "smaller",
    target: 200,
    status: 100,
    wantSuccess: true,
  }, {
    name: "bigger",
    target: 200,
    status: 300,
    wantSuccess: false,
  }];

  for (const tc of tcs) {
    test(tc.name, () => {
      const s = StatusAssertion.build("lte", tc.target);
      const res = s.assert({ status: tc.status } as any);
      assert.strictEqual(res.success, tc.wantSuccess, res.error);
    });
  }
});

describe("lt", () => {
  const tcs: TC[] = [{
    name: "matches",
    target: 200,
    status: 200,
    wantSuccess: false,
  }, {
    name: "smaller",
    target: 200,
    status: 100,
    wantSuccess: true,
  }, {
    name: "bigger",
    target: 200,
    status: 300,
    wantSuccess: false,
  }];

  for (const tc of tcs) {
    test(tc.name, () => {
      const s = StatusAssertion.build("lte", tc.target);
      const res = s.assert({ status: tc.status } as any);
      assert.strictEqual(res.success, tc.wantSuccess, res.error);
    });
  }
});

describe("eq", () => {
  const tcs: TC[] = [{
    name: "matches",
    target: 200,
    status: 200,
    wantSuccess: true,
  }, {
    name: "smaller",
    target: 200,
    status: 100,
    wantSuccess: false,
  }, {
    name: "bigger",
    target: 200,
    status: 300,
    wantSuccess: false,
  }];

  for (const tc of tcs) {
    test(tc.name, () => {
      const s = StatusAssertion.build("lte", tc.target);
      const res = s.assert({ status: tc.status } as any);
      assert.strictEqual(res.success, tc.wantSuccess, res.error);
    });
  }
});

describe("gt", () => {
  const tcs: TC[] = [{
    name: "matches",
    target: 200,
    status: 200,
    wantSuccess: false,
  }, {
    name: "smaller",
    target: 200,
    status: 100,
    wantSuccess: false,
  }, {
    name: "bigger",
    target: 200,
    status: 300,
    wantSuccess: true,
  }];

  for (const tc of tcs) {
    test(tc.name, () => {
      const s = StatusAssertion.build("lte", tc.target);
      const res = s.assert({ status: tc.status } as any);
      assert.strictEqual(res.success, tc.wantSuccess, res.error);
    });
  }
});

describe("gte", () => {
  const tcs: TC[] = [{
    name: "matches",
    target: 200,
    status: 200,
    wantSuccess: true,
  }, {
    name: "smaller",
    target: 200,
    status: 100,
    wantSuccess: false,
  }, {
    name: "bigger",
    target: 200,
    status: 300,
    wantSuccess: true,
  }];

  for (const tc of tcs) {
    test(tc.name, () => {
      const s = StatusAssertion.build("lte", tc.target);
      const res = s.assert({ status: tc.status } as any);
      assert.strictEqual(res.success, tc.wantSuccess, res.error);
    });
  }
});

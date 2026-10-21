import { describe, expect, it } from "vitest";
import {
  CHARITY_RATE,
  COMMISSION_RATE,
  PLATFORM_FEE_RATE,
  USER_PAYOUT_RATE,
  calculatePayoutSplit,
  calculateSuccessFee,
  penceToMollieAmount,
} from "./success-fee";

describe("calculatePayoutSplit", () => {
  it("on £10 DR: user keeps the full £10, no fee", () => {
    expect(calculatePayoutSplit(1000)).toEqual({
      compensationAmountPence: 1000,
      userPayoutPence: 1000,
      platformFeePence: 0,
      commissionPence: 0,
      charityPence: 0,
    });
  });

  it("uses 100% user / 0% Fifteen / 0% charity (personal-use build)", () => {
    expect(USER_PAYOUT_RATE).toBe(1);
    expect(COMMISSION_RATE).toBe(0);
    expect(CHARITY_RATE).toBe(0);
    expect(PLATFORM_FEE_RATE).toBe(0);
  });

  it("parts always sum to compensation", () => {
    for (const pence of [0, 1, 7, 99, 333, 1000, 12345]) {
      const s = calculatePayoutSplit(pence);
      expect(s.userPayoutPence + s.platformFeePence).toBe(
        s.compensationAmountPence,
      );
      expect(s.commissionPence + s.charityPence).toBe(s.platformFeePence);
    }
  });
});

describe("calculateSuccessFee (compat)", () => {
  it("maps to fee / commission / charity", () => {
    expect(calculateSuccessFee(1000)).toEqual({
      compensationAmountPence: 1000,
      commissionPence: 0,
      charityPence: 0,
      totalFeePence: 0,
    });
  });
});

describe("penceToMollieAmount", () => {
  it("formats pence as GBP decimal string", () => {
    expect(penceToMollieAmount(200)).toBe("2.00");
    expect(penceToMollieAmount(50)).toBe("0.50");
  });
});

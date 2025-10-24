import { render } from "@testing-library/react";
import { ProgressDashboard } from "@/src/components/progress/progress-dashboard";
import { type LeitnerBox } from "@/src/lib/srs";

const summary = {
  totalCards: 12,
  dueCards: 3,
  lastReviewedAt: new Date("2024-05-05T12:00:00Z")
};

const breakdown = [
  { box: 1 as LeitnerBox, count: 4, averageScore: 1.5 },
  { box: 2 as LeitnerBox, count: 3, averageScore: 2.5 },
  { box: 3 as LeitnerBox, count: 5, averageScore: 2.8 }
];

describe("ProgressDashboard", () => {
  it("renders summary metrics", () => {
    const { getByText } = render(<ProgressDashboard summary={summary} breakdown={breakdown} />);
    expect(getByText(/Total tracked/i)).toBeInTheDocument();
    expect(getByText("12")).toBeInTheDocument();
    expect(getByText(/Due now/i)).toBeInTheDocument();
    expect(getByText("3")).toBeInTheDocument();
  });

  it("shows Leitner boxes", () => {
    const { getByText } = render(<ProgressDashboard summary={summary} breakdown={breakdown} />);
    expect(getByText(/Box 1/)).toBeInTheDocument();
    expect(getByText(/Box 3/)).toBeInTheDocument();
  });
});

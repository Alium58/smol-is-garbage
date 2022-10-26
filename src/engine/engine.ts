import { Engine } from "grimoire-kolmafia";
import { getCurrentLeg, Task } from "../tasks/structure";
import { printProfits, ProfitTracker } from "./profits";

export class ProfitTrackingEngine extends Engine<never, Task> {
  profits: ProfitTracker;
  constructor(tasks: Task[], key: string) {
    super(tasks);
    this.profits = new ProfitTracker(key);
  }

  public checkLimits(task: Task, postcondition: (() => boolean) | undefined): void {
    super.checkLimits({ limit: { tries: 1 }, ...task }, postcondition); //sets the default value of limit
  }

  execute(task: Task): void {
    try {
      super.execute(task);
    } finally {
      this.profits.record(`${getCurrentLeg()}@${task.tracking ?? "Other"}`);
    }
  }

  destruct(): void {
    super.destruct();
    this.profits.save();
    printProfits(this.profits.all());
  }
}

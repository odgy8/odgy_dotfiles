import { createPoll } from "ags/time";

function Clock() {
  const clock = createPoll("", 1000, `date "+%d %m %Y @ %H:%M"`);

  return <label label={clock} />;
}

export default Clock;

/**
 * Quote Data
 * Curated trail notes: real, widely-attributed lines plus original AscendHabit
 * aphorisms (author: null -> shown as "Trail note").
 */

/** One quotable line and who said it. `null` author means an in-app aphorism. */
export interface Quote {
  text: string;
  author: string | null;
}

/** The full rotation shown by the daily quote strip. */
export const QUOTES: Quote[] = [
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
  },
  {
    text: 'Every action you take is a vote for the type of person you wish to become.',
    author: 'James Clear',
  },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'It is not the mountain we conquer, but ourselves.', author: 'Edmund Hillary' },
  { text: 'The best way out is always through.', author: 'Robert Frost' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'The climb is slow, but the view is earned.', author: null },
  { text: 'Two minutes counts. Showing up counts more than the size of the step.', author: null },
  { text: 'A missed day is a rest stop, not a dead end.', author: null },
  { text: 'Pack light. Pick one thing and carry it all the way up.', author: null },
  { text: 'The summit is not the point. The habit of climbing is.', author: null },
  { text: 'Small versions are not lesser versions. They are the rope that holds you.', author: null },
  { text: 'Some days you move fast. Some days you just keep the fire lit.', author: null },
  { text: 'Discipline is a trail you walk, not a wall you build.', author: null },
  { text: 'You do not need a perfect week. You need a next step.', author: null },
  { text: 'Rest is part of the route, not a detour from it.', author: null },
  { text: 'Progress hides in the ordinary days nobody applauds.', author: null },
  { text: 'Begin again as many times as the mountain asks.', author: null },
  { text: 'The hardest part of the climb is putting on the boots.', author: null },
  { text: 'One honest day beats seven imagined ones.', author: null },
  { text: 'Let the streak be evidence, not a leash.', author: null },
  { text: 'Go gently, but go.', author: null },
  { text: 'A quiet habit, repeated, outlasts a loud intention.', author: null },
  { text: 'Keep the pack light and the promise small enough to keep.', author: null },
];

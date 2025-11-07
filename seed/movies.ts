import { Movie, Actor, Cast, Award } from "../shared/types";

export const movies: Movie[] = [
  {
    PK: "m848326",
    SK: "xxxx",
    id: 848326,
    title: "Rebel Moon - Part One: A Child of Fire",
    releaseDate: "2023-12-15",
    overview:
      "When a peaceful colony on the edge of the galaxy finds itself threatened by the armies of the tyrannical Regent Balisarius, they dispatch Kora, a young woman with a mysterious past, to seek out warriors from neighboring planets to help them take a stand.",
  },
  {
    PK: "m872585",
    SK: "xxxx",
    id: 872585,
    title: "Oppenheimer",
    releaseDate: "2023-07-19",
    overview:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
  },
  {
    PK: "m787699",
    SK: "xxxx",
    id: 787699,
    title: "Wonka",
    releaseDate: "2023-12-06",
    overview:
      "Willy Wonka – chock-full of ideas and determined to change the world one delectable bite at a time – is proof that the best things in life begin with a dream.",
  },
];

export const actors: Actor[] = [
  {
    PK: "a1",
    SK: "xxxx",
    id: 1,
    name: "Joe Bloggs",
    bio: "An award-winning actor known for his powerful performances in independent films.",
    dateOfBirth: "1985-05-14",
  },
  {
    PK: "a2",
    SK: "xxxx",
    id: 2,
    name: "Alice Broggs",
    bio: "A leading actress celebrated for her roles in fantasy and drama films.",
    dateOfBirth: "1990-08-22",
  },
  {
    PK: "a3",
    SK: "xxxx",
    id: 3,
    name: "Joe Cloggs",
    bio: "A versatile performer known for action and comedy roles.",
    dateOfBirth: "1988-11-03",
  },
];

export const casts: Cast[] = [
  {
    PK: "c848326",
    SK: "1",
    movieId: 848326,
    actorId: 1,
    roleName: "Captain Kora",
    roleDescription: "A mysterious warrior with a hidden past.",
  },
  {
    PK: "c848326",
    SK: "2",
    movieId: 848326,
    actorId: 2,
    roleName: "Lyra",
    roleDescription: "An intelligent engineer who joins the rebellion.",
  },
  {
    PK: "c872585",
    SK: "3",
    movieId: 872585,
    actorId: 3,
    roleName: "Robert Oppenheimer",
    roleDescription: "The theoretical physicist behind the atomic bomb.",
  },
];

export const awards: Award[] = [
  {
    PK: "w1001",
    SK: "Academy",
    awardId: 1001,
    body: "Academy",
    category: "Best Actor",
    year: 2024,
  },
  {
    PK: "w1002",
    SK: "BAFTA",
    awardId: 1002,
    body: "BAFTA",
    category: "Best Picture",
    year: 2024,
  },
];

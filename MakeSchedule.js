const Luxon = require("luxon");

const programSpecs = [
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1a",
    "title": "World News",
    "description": "News, sport and business reports from around the world as well as the main news stories from the UK.",
    "program_image": "news.jpg",
  },
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1b",
    "title": "Sports",
    "description": "Sports sport sports",
    "program_image": "sports.png",
  },
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1c",
    "title": "Reality Show",
    "description": "Nothing of substance",
    "program_image": "reality.png",
  },
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1d",
    "title": "Lorem Ipsum",
    "description": "\"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.\"",
    "program_image": "lorem.png",
  },
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1e",
    "title": "Cats Cats Cats",
    "description": "A show about dogs",
    "program_image": "cats.png",
  },
  {
    "start_time_epoch": 1570345200,
    "duration_sec": 600,
    "program_id": "113ef7b8-892c-4350-b47f-edb997f93d1f",
    "title": "Rerun",
    "description": "",
    "program_image": "rerun.png",
  }
];

let start = Luxon.DateTime.fromISO(Luxon.DateTime.local().toFormat("yyyyLLdd"));
let end = Luxon.DateTime.local().plus({days: 2}).ts;

let programs = [];

let i = 0;
for(let time = start / 1000; time < (end - 4) / 1000;) {
  const programDuration = Math.max(15 * 60, Math.ceil(Math.random() * 10) * 20 * 60);
  let program = {...programSpecs[i]};
  program.start_time_epoch = time * 1000;
  program.duration_sec = programDuration;
  programs.push(program);

  i = (Math.floor(Math.random() * 100)) % programSpecs.length;
  time += programDuration;
}

let dailySchedule = {};
programs.forEach(program => {
  const date = Luxon.DateTime.fromMillis(program.start_time_epoch).toFormat("yyyyLLdd");

  if(!dailySchedule[date]) {
    dailySchedule[date] = [];
  }

  dailySchedule[date].push(program);
});

console.log(
  JSON.stringify(
  {
    reference_timezone: "GMT-0700",
    last_update: Luxon.DateTime.utc().toISO(),
    daily_schedules: dailySchedule
  }, null, 2)
);




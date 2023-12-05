const { REST, Routes } = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = require('./commands.js');

let register = [];
for (const name in commands) {
  register.push(commands[name].command.toJSON());
};

const rest = new REST().setToken(token);
(async () => {
  const data = await rest.put(
    Routes.applicationCommands(clientId),
    { body: register },
  );
  console.log(data);
})();

const { ActivityType, Client, Events, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });


const commands = require('./commands.js');
const events = require('./events.js');


// event handling
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (commands.hasOwnProperty(interaction.commandName)) {
        let command = commands[interaction.commandName];

        if (interaction.member !== null && command.hasOwnProperty('admin') && command.admin && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          await interaction.reply({
            content: 'You do not have permission to use this command',
            ephemeral: true
          });
          return;
        }

        command.execute(interaction, client);
        return;
      }

    } else if (events.hasOwnProperty(interaction.customId)) {
      await events[interaction.customId](interaction, client);
      return;
    }

    console.log
    await interaction.reply({
      content: 'Something went wrong, message <@723626729247342662>',
      ephemeral: true
    });
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: 'Something went wrong, message <@723626729247342662>',
      ephemeral: true
    });
  }
});

client.login(token);


// keep alive
var http = require('http');

http.createServer((req, res) => {
  res.write('Bot Online');
  res.end();
}).listen(8080);

client.on(Events.ClientReady, () => {
  let activities = ['Board Games', 'Card Games', 'Mega Games', 'Roleplay Games', 'War Games'];
  let i = 0;
  setInterval(() => client.user.setActivity(
    `${activities[i++ % activities.length]}`,
    { type: ActivityType.Playing }
  ), 5000)
});

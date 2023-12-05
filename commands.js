const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");

const welfareURL = process.env.WELFARE_URL;

module.exports = {
  crazy: {
    command: new SlashCommandBuilder()
      .setName("crazy")
      .setDescription("Crazy?!"),

    async execute(interaction) {
      await interaction.reply(
        "Crazy?\nI was crazy once...\nThey locked me in a room...\nA rubber room...\nA rubber room with RATS!\nAnd rats make me crazy!"
      );
    },
  },

  forms: {
    admin: true,

    command: new SlashCommandBuilder()
      .setName("forms")
      .setDescription("Create forms embed"),

    async execute(interaction) {
      let formEmbed = new EmbedBuilder()
        .setColor(0x00aa00)
        .setTitle("Use the buttons below to submit a form")
        .setDescription(
          "Use the suggestion form if you would like to request new games for the society to purchase. You can still leave ideas in <#834077673411444776> too\n\nUse the welfare form if you would like to leave a complaint about someone's behaviour."
        );

      let suggestButton = new ButtonBuilder()
        .setCustomId("suggest_btn")
        .setLabel("Suggest a Game")
        .setStyle(ButtonStyle.Primary);

      let welfareButton = new ButtonBuilder()
        .setLabel("Welfare")
        .setStyle(ButtonStyle.Link)
        .setURL(welfareURL);

      let actions = new ActionRowBuilder().addComponents(
        suggestButton,
        welfareButton
      );

      await interaction.reply({ embeds: [formEmbed], components: [actions] });
    },
  },

  gay: {
    command: new SlashCommandBuilder().setName("gay").setDescription("Gay"),

    async execute(interaction) {
      await interaction.reply("<@723626729247342662> is gay");
    },
  },

  help: {
    command: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Get help on commands"),

    async execute(interaction, client) {
      let cmds = await client.application.commands.fetch();
      let names = Object.keys(module.exports).sort();
      let helpEmbed = new EmbedBuilder()
        .setTitle("Help on commands")
        .setColor(0xf542e3);
      names.forEach((name) =>
        helpEmbed.addFields({
          name: `</${name}:${cmds.findKey((cmd) => cmd.name === name)}>`,
          value: `${module.exports[name].command.description}`,
        })
      );
      await interaction.reply({ embeds: [helpEmbed] });
    },
  },

  insult: {
    command: new SlashCommandBuilder()
      .setName("insult")
      .setDescription("Send an insult"),

    async execute(interaction) {
      let insults = [
        "Your mother was a hamster and your father smelt of elderberries",
      ];
      await interaction.reply(
        insults[Math.floor(Math.random() * insults.length)]
      );
    },
  },

  ping: {
    command: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping TableTopBot"),

    async execute(interaction) {
      await interaction.reply({
        content: `Latency: ${Date.now() - interaction.createdTimestamp}ms`,
        ephemeral: true,
      });
    },
  },

  roll: {
    command: new SlashCommandBuilder()
      .setName("roll")
      .setDescription("Roll some die")
      .addStringOption((option) =>
        option.setName("dice").setDescription("What to roll, e.g. 2d8+4")
      )
      .addBooleanOption((option) =>
        option
          .setName("hidden")
          .setDescription("Hide your roll from everyone else")
      ),

    async execute(interaction) {
      let dice = interaction.options.getString("dice") ?? "d20";
      let hidden = interaction.options.getBoolean("hidden") ?? false;
      let parsed = dice.match(/^(\d*)d(\d+)([\+-]\d+)?$/i);

      if (parsed == null) {
        await interaction.reply({
          content: "Invalid dice syntax",
          ephemeral: true,
        });
        return;
      }

      let numDice = parseInt(parsed[1]);
      let sides = parseInt(parsed[2]);
      let modifier = parseInt(parsed[3]);

      if (isNaN(numDice)) numDice = 1;

      if (numDice <= 0) {
        await interaction.reply({
          content: "You must roll at least 1 die",
          ephemeral: true,
        });
        return;
      }

      let rolls = [];
      for (let i = 0; i < numDice; i++)
        rolls.push(1 + Math.floor(Math.random() * sides));

      let total = rolls.reduce((a, b) => a + b);

      let output = rolls.join(" + ");

      if (!isNaN(modifier)) {
        total += modifier;
        if (modifier > 0) output += " + ***" + modifier.toString() + "***";
        else output += " - ***" + (-modifier).toString() + "***";
      }

      if (numDice !== 1 || !isNaN(modifier)) output += ` = ${total}`;
      else output = total;

      output = `You roll ${dice} and get: ${output}`;

      if (output.length > 2000) {
        await interaction.reply({
          content: "Results string too long, try again with fewer dice",
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: output,
        ephemeral: hidden,
      });
    },
  },

  "sync-calendar": {
    command: new SlashCommandBuilder()
      .setName("sync-calendar")
      .setDescription("Synchronize events calendar with notion"),

    admin: true,

    async execute(interaction) {
      await interaction.reply({ content: "Calendar Synced", ephemeral: true });
    },
  },
};

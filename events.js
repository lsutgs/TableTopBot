const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { Client } = require('@notionhq/client');

const databaseId = process.env.DATABASE_ID;
const destGuildId = process.env.GUILD_ID;
const destChannelId = process.env.CHANNEL_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });

let lookup = {
  'Board Games': '<@&735868337418010644>',
  'Card Games': '<@&735868260850860032>',
  'Mega Games': '<@&1071216977185615992>',
  'Roleplay Games': '<@&735868448206487562>',
  'War Games': '<@&735868194530525316>'
}

module.exports = {
  async suggest_btn(interaction) {
    let suggestModal = new ModalBuilder()
      .setCustomId('suggest_modal')
      .setTitle('Suggest a Game')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder()
          .setCustomId('student_id')
          .setStyle(TextInputStyle.Short)
          .setLabel('Student ID')
          .setPlaceholder('Your F or B number...')),
        new ActionRowBuilder().addComponents(new TextInputBuilder()
          .setCustomId('suggestion')
          .setStyle(TextInputStyle.Paragraph)
          .setLabel('Your Suggestion')
          .setPlaceholder('Game you would like to suggest...'))
      );

    await interaction.showModal(suggestModal);
  },

  async suggest_modal(interaction) {
    let thanksEmbed = new EmbedBuilder()
      .setColor(0x00aa00)
      .setTitle('Thanks for your suggestion!')
      .addFields(
        { name: 'Student ID', value: interaction.fields.getTextInputValue('student_id') },
        { name: 'Suggestion', value: interaction.fields.getTextInputValue('suggestion') },
        { name: 'Applicable Section', value: 'Not Provided' }
      );

    let sectionRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('section_select')
        .setPlaceholder('Choose section (optional)')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Board Games')
            .setValue('Board Games'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Card Games')
            .setValue('Card Games'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Mega Games')
            .setValue('Mega Games'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Roleplay Games')
            .setValue('Roleplay Games'),
          new StringSelectMenuOptionBuilder()
            .setLabel('War Games')
            .setValue('War Games')
        )
    );
    let submitRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('submit_suggestion')
        .setLabel('Submit Form')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      embeds: [thanksEmbed],
      components: [sectionRow, submitRow],
      ephemeral: true
    });
  },

  async section_select(interaction) {
    let studentId = interaction.message.embeds[0].fields[0].value;
    let suggestion = interaction.message.embeds[0].fields[1].value;
    let updatedEmbed = new EmbedBuilder()
      .setColor(0x00aa00)
      .setTitle('Your suggestion')
      .addFields(
        { name: 'Student ID', value: studentId },
        { name: 'Suggestion', value: suggestion },
        { name: 'Applicable Section', value: interaction.values[0] }
      );

    await interaction.update({ embeds: [updatedEmbed] });
  },

  async submit_suggestion(interaction, client) {
    let studentId = interaction.message.embeds[0].fields[0].value;
    let suggestion = interaction.message.embeds[0].fields[1].value;
    let section = interaction.message.embeds[0].fields[2].value;

    if (lookup.hasOwnProperty(section))
      section = lookup[section]

    let submittedEmbed = new EmbedBuilder()
      .setColor(Math.floor(Math.random() * 0x1000000))
      .setTitle('Submitted Suggestion')
      .addFields(
        { name: 'Student ID', value: studentId },
        { name: 'Suggestion', value: suggestion },
        { name: 'Section', value: section }
      )
    await interaction.update({
      content: '### Thank you for your suggestion!\nYour response has been recorded',
      embeds: [],
      components: []
    });

    let actions = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('approve_suggestion_btn')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('remove_suggestion_btn')
        .setLabel('Remove')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('manual_suggestion_btn')
        .setLabel('Resolve Manually')
        .setStyle(ButtonStyle.Secondary)
    );

    client.guilds.cache.get(destGuildId).channels.cache.get(destChannelId).send({
      embeds: [submittedEmbed],
      components: [actions]
    });
  },

  async approve_suggestion_btn(interaction) {
    let suggestion = interaction.message.embeds[0].fields[1].value;
    let section = interaction.message.embeds[0].fields[2].value;

    for (const prop in lookup) {
      if (section === lookup[prop]) {
        section = prop;
        break;
      }
    }

    await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        Section: {
          type: 'rich_text',
          rich_text: [{
            type: 'text',
            text: {
              content: section
            },
          }]
        },
        'Task name': {
          id: 'title',
          type: 'title',
          title: [{
            type: 'text',
            text: {
              content: suggestion
            }
          }]
        },
        Type: {
          type: 'multi_select',
          multi_select: [{
            name: 'New Games'
          }]
        },
        Assignee: {
          type: 'people',
          people: []
        },
        Status: {
          type: 'status',
          status: {
            name: 'Not started',
          }
        },
        Due: {
          type: 'date',
          date: null
        }
      }
    });

    let actions = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('approve_suggestion_btn')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId('remove_suggestion_btn')
        .setLabel('Remove')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId('manual_suggestion_btn')
        .setLabel('Resolve Manually')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    await interaction.update({ components: [actions] });
  },

  async manual_suggestion_btn(interaction) {
    let actions = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('approve_suggestion_btn')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId('remove_suggestion_btn')
        .setLabel('Remove')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId('manual_suggestion_btn')
        .setLabel('Resolve Manually')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    await interaction.update({ components: [actions] });
  },

  async remove_suggestion_btn(interaction) {
    await interaction.message.delete();
  }
};

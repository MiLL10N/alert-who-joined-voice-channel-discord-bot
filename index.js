/* eslint-disable max-len */
const discord = require('discord.js');
const voiceDiscord = require('@discordjs/voice');
const TOKEN = '';
const GUILD_ID = '';
const discordTTS = require('discord-tts');
const {createWorker} = require('tesseract.js');
const textToImage = require('text-to-image');
const audioPlayer = new voiceDiscord.AudioPlayer;

let jointChannel;
const client = new discord.Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'GuildMembers',
    'GuildVoiceStates',
    'MessageContent',
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const convertText2Image = async (username) => {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  });
  const dataUri = await textToImage.generate(username);
  const imageBuffer = Buffer.from(dataUri.replace('data:image/png;base64,', ''), 'base64');
  const {data: {text}} = await worker.recognize(imageBuffer);
  await worker.terminate();
  return text;
};

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (oldState?.channel?.members?.size === 1 && oldState?.channel?.members?.get('1071478757937922088')?.user?.username === 'Alert who joined vc') {
    await oldState?.channel?.members?.get('1071478757937922088').voice.disconnect();
  }

  if (!oldState?.channelId && newState.member.user.username !== 'Alert who joined vc') {
    const stream = discordTTS.getVoiceStream(await convertText2Image(newState.member.user.username) + ' has joined a channel');
    const audioResource = voiceDiscord.createAudioResource(stream, {inputType: voiceDiscord.StreamType.Arbitrary, inlineVolume: true});
    if (jointChannel) {
      jointChannel.subscribe(audioPlayer);
      await audioPlayer.play(audioResource);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'join') {
    jointChannel = voiceDiscord.joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: GUILD_ID,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
  } else if (interaction.commandName === 'leave') {
    if (jointChannel) {
      jointChannel.destroy();
    }
  }
});

client.login(TOKEN);

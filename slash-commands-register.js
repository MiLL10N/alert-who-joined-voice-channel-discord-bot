/* eslint-disable max-len */
const discord = require('discord.js');
const GUILD_ID = '';
const CLIENT_ID = '';
const TOKEN = '';

const rest = new discord.REST({version: '10'}).setToken(TOKEN);
const Routes = discord.Routes;

const commands = [
  {
    name: 'join',
    description: 'Join channel you currently in',
  },
  {
    name: 'leave',
    description: 'Leave channel bot currently in',
  },
];

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        {body: commands},
    );

    console.log('Slash commands registered successfully :)');


    // rest.put(Routes.applicationCommands(CLIENT_ID), {body: []})
    //     .then(() => console.log('Successfully deleted all application commands.'))
    //     .catch(console.error);
  } catch (error) {
    console.log('Something went wrong when try to creating slash commands with error: ' + error);
  }
})();



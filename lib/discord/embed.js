const { EmbedBuilder } = require('discord.js');
const colors = require('./colors.js');

module.exports = (
    client,
    title,
    description,
    color,
    fields,
    url,
    author,
    thumbnail,
    image,
    footer
) => {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color ?? Colors.Green);
    
    if (url) embed.setURL(url);
    if (author) embed.setAuthor(author);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (fields) embed.setFields(fields);
    if (image) embed.setImage(image);

    embed.setFooter(footer ?? {
        iconURL: client.user.avatarURL(),
        text: `Server Monitor • PID: ${process.pid}`
    });

    return embed;
};
const inquirer = require('inquirer');
const fs = require('fs');
const util = require('util');

var licenses = null;

async function collectTitles() {
    const result = await inquirer.prompt([
        {
            name: 'titles',
            type: 'checkbox',
            choices: ['Description', 'Installation', 'Usage', 'License', 'Contributing', 'Tests', 'Questions', 'Custom section'],
            message: 'Select/Deselect titles to keep the ones you would like to include in your ReadMe file.',
            default: ['Description', 'Installation', 'Usage', 'License', 'Contributing', 'Tests', 'Questions']
        }
    ]);
    return result.titles;
}


async function collectValues(titles) {

    var fileContent = new Map();

    const questions = ['projectName', ...titles];

    for (question of questions) {
        switch (question) {

            case 'projectName':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'input',
                        message: 'What is the name of your project?'
                    }
                ]);
                fileContent.set('name', question.value);
                break;

            case 'Description':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write a description of the function of your project.'
                    }
                ]);
                fileContent.set('Description', question.value);
                break;

            case 'Installation':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the installation process of your project.'
                    }
                ]);
                fileContent.set('Installation', question.value);
                break;

            case 'Usage':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Describe the usage of your project.'
                    }
                ]);
                fileContent.set('Usage', question.value);
                break;

            case 'License':
                var successful = await loadLicenses();
                if (!successful) {
                    return;
                }
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'list',
                        choices: licenses.list,
                        message: 'Choose the lisence for your projects.'
                    }
                ]);
                var license = licenses.licenses[licenses.list.indexOf(question.value)];
                fileContent.set('License', `This project is covered under the following license: ${question.value}. For more information, please visit [${license.url}](${license.url})`);
                fileContent.set('badge', license.markdown);
                break;

            case 'Contributing':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the guidelines for contributing to your project.'
                    }
                ]);
                fileContent.set('Contributing', question.value);
                break;

            case 'Tests':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the testing instructions for your project.'
                    }
                ]);
                fileContent.set('Tests', question.value);
                break;

            case 'Questions':
                var question = await inquirer.prompt([
                    {
                        name: 'email',
                        type: 'input',
                        message: 'Provide an email address that you would like to be reached at for questions about this project.'
                    },
                    {
                        name: 'github',
                        type: 'input',
                        message: 'Provide a url to your GitHub account.'
                    },
                    {
                        name: 'questions',
                        type: 'editor',
                        message: 'Write additional instructions for reaching you regarding questions about the project.'
                    }


                ]);
                fileContent.set('Questions', `Email: ${question.email}\n\nGithub: ${question.github}\n\n${question.questions}`);
                break;

            case 'Custom section':
                while (true) {
                    var question = await inquirer.prompt([
                        {
                            name: 'title',
                            type: 'input',
                            message: 'Write the title of the custom section.'
                        },
                        {
                            name: 'content',
                            type: 'editor',
                            message: 'Write the content of the custom section.'
                        },

                    ]);
                    fileContent.set(question.title, question.content);
                    var moreCustom = await inquirer.prompt([
                        {
                            name: 'another',
                            type: 'confirm',
                            message: 'Would you like to add another custom field?'
                        }
                    ]);
                    if (!moreCustom.another) {
                        break;
                    }
                }
                break;
        }
    }
    return fileContent;
}

function createContent(fileContent) {

    var text = `# ${fileContent.get('name')}`;

    fileContent.delete('name');

    if (fileContent.has('badge')) {
        text += `   ${fileContent.get('badge')}`;
        fileContent.delete('badge');
    }
    
    text += '\n\n';

    if (fileContent.has('Description')) {
        text += `## Description\n\n${fileContent.get('Description')}\n\n\n\n`;
        fileContent.delete('Description');
    }

    var table = "## Table of content\n\n";
    var rest = "";

    for (let [key, value] of fileContent) {

        table += `### [${key}](##-${key.split(" ").join("-")})\n\n`;
        rest += `## ${key}\n\n${value}\n\n\n\n`;
    }

    text += table + '\n\n' + rest;

    return text;
}


function printContent(text) {
    fs.writeFile('README.md', text, err => err ? console.log("Something went wrong, please ensure that all dependencies are installed.") : null);
}

async function loadLicenses() {

    const content = util.promisify(fs.readFile);
    try {
        licenses = JSON.parse(await content('assets/licenses.json', 'utf8'));
        return true;

    } catch (e) {
        if (e.errno == -2) {
            console.log("Error encountered, please ensure that all assets are in the assets folder, and all dependencies are installed.")
        } else {
            console.log(e);
        }
        return false;
    }
}

(async function () {
    const titles = await collectTitles();
    const fileContent = await collectValues(titles);
    const text = createContent(fileContent);
    printContent(text);
})();



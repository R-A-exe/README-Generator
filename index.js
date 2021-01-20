const inquirer = require('inquirer');
const fs = require('fs');
const util = require('util');

var licenses = null;

var fileContent = { name: "", email: "", github: "", description: "", table: new Array(), installation: "", usage: "", license: "", contributing: "", tests: "", questions: "", custom: new Map() };

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
                fileContent.name = question.value;
                break;

            case 'Description':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write a description of the function of your project.'
                    }
                ]);
                fileContent.description = question.value;
                break;

            case 'Installation':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the installation process of your project.'
                    }
                ]);
                fileContent.installation = question.value;
                break;

            case 'Usage':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Describe the usage of your project.'
                    }
                ]);
                fileContent.usage = question.value;
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
                fileContent.license = question.value;
                break;

            case 'Contributing':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the guidelines for contributing to your project.'
                    }
                ]);
                fileContent.contributing = question.value;
                break;

            case 'Tests':
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the testing instructions for your project.'
                    }
                ]);
                fileContent.tests = question.value;
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
                fileContent.email = question.email;
                fileContent.github = question.github;
                fileContent.questions = question.questions;
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
                    fileContent.custom.set(question.title, question.content);
                    var moreCustom = await inquirer.prompt([
                        {
                            name: 'another',
                            type: 'confirm',
                            message: 'Would you like to add another custom field?'
                        }
                    ]);
                    if(!moreCustom.another){
                        break;
                    }
                }
                break;
        }
    }

    console.log(fileContent);

}

function createContent(){

}


function printContent(){


}

async function loadLicenses() {

    const content = util.promisify(fs.readFile);
    try {
        licenses = JSON.parse(await content('assets/licenses.json', 'utf8'));
        return true;

    } catch (e) {
        if (e.errno == -2) {
            console.log("Error encountered, please ensure that all assets are in the assets folder, then try again.")
        } else {
            console.log(e);
        }
        return false;
    }
}

(async function() {
    var titles = await collectTitles();
    collectValues(titles);
})();



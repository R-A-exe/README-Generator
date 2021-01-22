const inquirer = require('inquirer');
const fs = require('fs');
const util = require('util');

var licenses = null; //will contain the object licenses stored in licenses.json

async function collectTitles() {  //collect the list of titles that the user would like to have in their readme
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


async function collectValues(titles) {  //Collect content of each chosen title

    var fileContent = new Map(); //store content into this map

    const questions = ['projectName', ...titles];  //add project name to the list of titles

    for (question of questions) {  //Loop through titles and ask questions based on title
        switch (question) {

            case 'projectName': //collect project name
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'input',
                        message: 'What is the name of your project?'
                    }
                ]);
                fileContent.set('name', question.value);
                break;

            case 'Description': //collect project description if applicable
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write a description of the function of your project.'
                    }
                ]);
                fileContent.set('Description', question.value);
                break;

            case 'Installation': //collect project installation if applicable
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the installation process of your project.'
                    }
                ]);
                fileContent.set('Installation', question.value);
                break;

            case 'Usage': //collect project usage if applicable
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Describe the usage of your project.'
                    }
                ]);
                fileContent.set('Usage', question.value);
                break;

            case 'License': //collect project license if applicable
                var successful = await loadLicenses(); //load licenses object
                if (!successful) { //stop if failed load
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
                fileContent.set('badge', license.markdown); //get badge to be added to read me
                break;

            case 'Contributing': //collect project contribution if applicable
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the guidelines for contributing to your project.'
                    }
                ]);
                fileContent.set('Contributing', question.value);
                break;

            case 'Tests': v//collect project testing if applicable
                var question = await inquirer.prompt([
                    {
                        name: 'value',
                        type: 'editor',
                        message: 'Write the testing instructions for your project.'
                    }
                ]);
                fileContent.set('Tests', question.value);
                break;

            case 'Questions': //collect email, github account and ways to reach author for questions if applicable
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

            case 'Custom section': //collect title and content of custom section if applicable
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
                    fileContent.set(question.title, question.content); //ask user if they would like to add another custom section
                    var moreCustom = await inquirer.prompt([
                        {
                            name: 'another',
                            type: 'confirm',
                            message: 'Would you like to add another custom field?'
                        }
                    ]);
                    if (!moreCustom.another) { //I no, exit while loop, else, repeat loop
                        break;
                    }
                }
                break;
        }
    }
    return fileContent; //return map
}

function createContent(fileContent) {

    var text = `# ${fileContent.get('name')}`; //load project name to text
    fileContent.delete('name');                 //remove project name from map

    if (fileContent.has('badge')) { //if license was selected
        text += `   ${fileContent.get('badge')}`; //load badge to text
        fileContent.delete('badge'); //remove badge from map
    }
    
    text += '\n\n';

    if (fileContent.has('Description')) { //if description was selected
        text += `## Description\n\n${fileContent.get('Description')}\n\n\n\n`; //load description into text
        fileContent.delete('Description'); //remove dsecription from map
    }

    var table = "## Table of content\n\n"; //load table of content title
    var rest = "";

    for (let [key, value] of fileContent) {  //for each remaining item in the map

        table += `### [${key}](##-${key.split(" ").join("-")})\n\n`;  //add its title to the table of content
        rest += `## ${key}\n\n${value}\n\n\n\n`;        //add its title and content to the rest variable that will be concatinated to the text variable
    }

    text += table + '\n\n' + rest; //add the table to the text variable (which contains title, badge and description), then add the rest of the content

    return text; //return the text
}


function printContent(text) { //write content to file using fs.
    fs.writeFile('README.md', text, err => err ? console.log("Something went wrong, please ensure that all dependencies are installed.") : null);
    console.log("All done! Please retrieve your README file from this directory.")
}

async function loadLicenses() { //function to load licenses from the json file.

    const content = util.promisify(fs.readFile);
    try {
        licenses = JSON.parse(await content('assets/licenses.json', 'utf8')); //load object into global variable
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
    const titles = await collectTitles(); //await titles selection, then
    const fileContent = await collectValues(titles); //await content of each title, then
    const text = createContent(fileContent);// create the text from content, then
    printContent(text);//print the text to file.
})();



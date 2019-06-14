"use strict";
const paths = require("path");
const { execSync } = require("child_process");
const figlet = require("figlet");

class MaestroPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.maestro = serverless.service.custom.maestro;
    this.serverlessLog = serverless.cli.log.bind(serverless.cli);

    this.stdin = process.stdin;
    this.stdout = process.stdout;
    this.stderr = process.stderr;

    this.commands = {
      maestro: {
        usage: 'Just run "sls maestro play" ',
        commands: {
          play: {
            lifecycleEvents: ["run"],
            usage: "Just play"
          }
        }
      }
    };

    this.hooks = {
      "maestro:play:run": this.run.bind(this)
    };
  }

  clone(repoPath) {
    const simpleGit = require("simple-git")(__dirname);
    simpleGit.clone(repoPath);
    this.serverless.cli.log("cloned");
  }
  cloneProject() {
    const simpleGit = require("simple-git")(__dirname);
    simpleGit.clone(project.git);
    let start = project.git.lastIndexOf("/") + 1;
    let final = project.git.lastIndexOf(".");
    let repoName = project.git.slice(start, final);
    console.log(repoName);
    project.path = __dirname + "/" + repoName;
    console.log(project.path);
  }

  run() {
    this.serverlessLog(
      figlet.textSync("Maestro --->", {
        font: "Ghost"
        // horizontalLayout: "default",
        // verticalLayout: "default"
      })
    );
    this.maestro.forEach(object => {
      Object.keys(object).forEach(key => {
        let project = object[key];
        project.name = key;
        if (project.git) {
          cloneProject();
        }
        this.runCommand(project);
      });
    });
  }

  runCommand(project) {
    const { name, path, commands } = project;
    this.serverlessLog(`Maestro started to play on "${name}"`);

    commands.forEach(command => {
      const workDir = paths.resolve(path);
      this.serverlessLog(`Maestro in "${workDir}"`);
      this.serverlessLog(`Maestro running "${command}" `);
      execSync(`${command}`, {
        stdio: [this.stdin, this.stdout, this.stderr],
        cwd: workDir
      });
      this.serverlessLog(`Maestro in "${workDir}"`);
      this.serverlessLog(`Maestro finished "${command}"`);
    });

    this.serverlessLog(`Maestro ended his play on "${name}"`);
  }
}

module.exports = MaestroPlugin;

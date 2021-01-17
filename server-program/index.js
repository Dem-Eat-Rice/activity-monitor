const express = require('express');
const { parse } = require('path');
const { cpuUsage } = require('process');
const app = express();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PORT = 5000;

const WSL = 'top -b -n 2 | grep "%Cpu"';

app.get('/cpu-usage', async (req, res, next) => {
    const outputOfCommand = await exec(WSL);
    const commandDetails = outputOfCommand.stdout;
    const secondLine = commandDetails.split('\n')[1];
    const splitSecondLine = secondLine.split(' ');
    let cpuUsage = parseFloat(splitSecondLine[1]) + parseFloat(splitSecondLine[4]);
    if (isNaN(cpuUsage)) {
        cpuUsage = parseFloat(splitSecondLine[2]) + parseFloat(splitSecondLine[5]);
        if (isNaN(cpuUsage)) {
            next(new Error('CPU usage was NaN'));
            return;
        }
    }
    res.json({ cpuUsage: cpuUsage.toString() + '%' });
});

app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
    console.log(`Server process listening on port ${PORT}~`);
});
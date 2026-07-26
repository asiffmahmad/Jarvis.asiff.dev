// Test all audio generation approaches systematically
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs-extra');

const execAsync = promisify(exec);
const AUDIO_DIR = path.join(__dirname, 'storage/audio');
const TEMP_DIR = path.join(__dirname, 'storage/temp');

fs.ensureDirSync(AUDIO_DIR);
fs.ensureDirSync(TEMP_DIR);

const text = "Hello I am Jarvis.";
const voice = "Samantha";
const escaped = text.replace(/'/g, "'\\''");

async function tryCmd(label, cmd) {
  console.log(`\n[${label}]`);
  console.log(`$ ${cmd}`);
  try {
    await execAsync(cmd);
    console.log(`✅ SUCCESS`);
    return true;
  } catch (e) {
    console.log(`❌ FAIL: ${e.stderr || e.message}`);
    return false;
  }
}

async function main() {
  const aiff = path.join(TEMP_DIR, 'test.aiff');
  const caf  = path.join(TEMP_DIR, 'test.caf');
  const m4a  = path.join(AUDIO_DIR, 'test_out.m4a');

  // Step 1: Generate AIFF (most compatible say output)
  const aiffOk = await tryCmd('say → AIFF', `say -v "${voice}" -o "${aiff}" '${escaped}'`);
  if (!aiffOk) { console.log('Cannot even generate AIFF, aborting'); return; }
  console.log(`   AIFF size: ${fs.statSync(aiff).size} bytes`);

  // Step 2a: afconvert AIFF → M4A (no bitrate flag)
  const m4aOk = await tryCmd('afconvert AIFF→M4A (no bitrate)', `afconvert -f m4af -d aac "${aiff}" "${m4a}"`);
  if (m4aOk) {
    console.log(`   M4A size: ${fs.statSync(m4a).size} bytes`);
    console.log(`\n🎉 PIPELINE: say → afconvert works! Use .m4a`);
    return;
  }

  // Step 2b: afconvert AIFF → CAF
  const cafOk = await tryCmd('afconvert AIFF→CAF', `afconvert "${aiff}" "${caf}"`);
  if (cafOk) {
    console.log(`\n🎉 PIPELINE: say → caf works! Use .caf`);
    return;
  }

  // Step 2c: just serve the AIFF directly
  const aiffOut = path.join(AUDIO_DIR, 'test_direct.aiff');
  fs.copySync(aiff, aiffOut);
  console.log(`\n⚠️  FALLBACK: Serve AIFF directly at ${aiffOut}`);
  console.log(`   Size: ${fs.statSync(aiffOut).size} bytes`);
  console.log(`   Note: Works in Safari, may not work in Chrome`);
}

main().catch(console.error);

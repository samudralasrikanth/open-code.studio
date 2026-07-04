export async function executeTerminalCommand(window, command, timeoutMs = 5000) {
  // Focus terminal
  const textarea = window.locator(".xterm-helper-textarea").first();
  if (await textarea.isVisible({ timeout: 2000 })) {
    await textarea.focus();
    await textarea.type(`${command}\n`);
  } else {
    await window.mouse.click(600, 700);
    await window.keyboard.type(command);
    await window.keyboard.press("Enter");
  }

  await window.waitForTimeout(2000);

  // Return evaluation check on terminal DOM
  const hasPrompt = await window.evaluate(() => {
    const text = document.body.innerText;
    return /.*[\$%#]\s*$/.test(text) || text.includes("open-code.studio");
  });

  return { command, success: hasPrompt };
}

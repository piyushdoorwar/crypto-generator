(() => {
  const modeTabs = Array.from(document.querySelectorAll('.mode-tab'));
  const modePanels = Array.from(document.querySelectorAll('.mode-panel'));

  const setActiveMode = (mode) => {
    modeTabs.forEach((tab) => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    modePanels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === `mode-${mode}`);
    });
  };

  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveMode(tab.dataset.mode));
  });

  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const passwordOutput = document.getElementById('passwordOutput');
  const copyPasswordBtn = document.getElementById('copyPasswordBtn');
  const regenPasswordBtn = document.getElementById('regenPasswordBtn');
  const generatePasswordBtn = document.getElementById('generatePasswordBtn');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  const optUpper = document.getElementById('optUpper');
  const optLower = document.getElementById('optLower');
  const optNumbers = document.getElementById('optNumbers');
  const optSymbols = document.getElementById('optSymbols');
  const optAvoid = document.getElementById('optAvoid');

  const bulkToggle = document.getElementById('bulkToggle');
  const bulkControls = document.getElementById('bulkControls');
  const bulkCount = document.getElementById('bulkCount');
  const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');
  const bulkCopyBtn = document.getElementById('bulkCopyBtn');
  const bulkList = document.getElementById('bulkList');

  const hashInput = document.getElementById('hashInput');
  const saltInput = document.getElementById('saltInput');
  const algoSelect = document.getElementById('algoSelect');
  const hashList = document.getElementById('hashList');

  const similarChars = new Set(['O', '0', 'l', '1']);
  const charSets = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?/~-=\\',
  };

  const encoder = new TextEncoder();

  const randomInt = (max) => {
    const array = new Uint32Array(1);
    const maxUint = 0xffffffff;
    const limit = maxUint - (maxUint % max);
    let value = 0;
    do {
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);
    return value % max;
  };

  const randomChar = (chars) => chars[randomInt(chars.length)];

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const getSelectedSets = () => {
    const sets = [];
    if (optUpper.checked) sets.push(charSets.upper);
    if (optLower.checked) sets.push(charSets.lower);
    if (optNumbers.checked) sets.push(charSets.numbers);
    if (optSymbols.checked) sets.push(charSets.symbols);

    if (optAvoid.checked) {
      return sets.map((set) => set.split('').filter((ch) => !similarChars.has(ch)).join(''));
    }

    return sets;
  };

  const generatePassword = () => {
    const length = Number(lengthSlider.value);
    const sets = getSelectedSets().filter((set) => set.length > 0);

    if (sets.length === 0) {
      return '';
    }

    const requiredChars = sets.map((set) => randomChar(set));
    const combined = sets.join('');
    const remaining = Array.from({ length: Math.max(length - requiredChars.length, 0) }, () =>
      randomChar(combined)
    );

    const result = shuffle(requiredChars.concat(remaining)).slice(0, length);
    return result.join('');
  };

  const scoreStrength = (length, variety) => {
    const lengthScore = Math.min(60, (length / 64) * 60);
    const varietyScore = (variety / 4) * 40;
    return Math.round(lengthScore + varietyScore);
  };

  const strengthLabel = (score) => {
    if (score >= 80) return 'Elite';
    if (score >= 65) return 'Strong';
    if (score >= 45) return 'Balanced';
    return 'Weak';
  };

  const updateStrength = (password) => {
    const length = password.length;
    const variety = [optUpper, optLower, optNumbers, optSymbols].filter((opt) => opt.checked).length;
    const score = length === 0 ? 0 : scoreStrength(length, variety);
    const label = strengthLabel(score);

    strengthFill.style.width = `${score}%`;
    strengthFill.dataset.level = label.toLowerCase();
    strengthText.textContent = label;
  };

  const updatePasswordPreview = () => {
    const password = generatePassword();
    passwordOutput.value = password;
    passwordOutput.placeholder = password ? '' : 'Select at least one option.';
    updateStrength(password);
  };

  const updateBulkButton = () => {
    const count = Number(bulkCount.value) || 10;
    bulkGenerateBtn.textContent = `Generate ${count} passwords`;
  };

  const setBulkActive = (isActive) => {
    bulkControls.classList.toggle('active', isActive);
    bulkList.classList.toggle('active', isActive);
    if (!isActive) {
      bulkList.innerHTML = '';
    }
  };

  const copyText = async (text, button) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (button) {
        button.classList.add('copied');
        setTimeout(() => button.classList.remove('copied'), 1200);
      }
    } catch (err) {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
  };

  const renderBulkList = (items) => {
    bulkList.innerHTML = '';
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'bulk-item';
      const indexSpan = document.createElement('span');
      indexSpan.className = 'bulk-index';
      indexSpan.textContent = `${index + 1}`;
      const textSpan = document.createElement('span');
      textSpan.className = 'bulk-text';
      textSpan.textContent = item;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'mini-copy';
      copyBtn.type = 'button';
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M9 9h11v11H9z" />
          <path d="M4 4h11v11H4z" />
        </svg>
      `;
      copyBtn.addEventListener('click', () => copyText(item, copyBtn));
      li.append(indexSpan, textSpan, copyBtn);
      bulkList.appendChild(li);
    });
  };

  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
    updatePasswordPreview();
  });

  [optUpper, optLower, optNumbers, optSymbols, optAvoid].forEach((opt) =>
    opt.addEventListener('change', updatePasswordPreview)
  );

  generatePasswordBtn.addEventListener('click', updatePasswordPreview);
  regenPasswordBtn.addEventListener('click', updatePasswordPreview);

  copyPasswordBtn.addEventListener('click', () => copyText(passwordOutput.value, copyPasswordBtn));

  bulkToggle.addEventListener('change', (event) => setBulkActive(event.target.checked));
  bulkCount.addEventListener('input', updateBulkButton);

  bulkGenerateBtn.addEventListener('click', () => {
    const count = Math.max(2, Math.min(50, Number(bulkCount.value) || 10));
    const items = Array.from({ length: count }, () => generatePassword()).filter(Boolean);
    renderBulkList(items);
  });

  bulkCopyBtn.addEventListener('click', () => {
    const items = Array.from(bulkList.querySelectorAll('.bulk-text')).map((node) => node.textContent);
    if (items.length) {
      copyText(items.join('\n'), bulkCopyBtn);
    }
  });

  const bufferToHex = (buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const md5 = (message) => {
    const rotateLeft = (lValue, iShiftBits) => (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    const addUnsigned = (lX, lY) => {
      const lX4 = lX & 0x40000000;
      const lY4 = lY & 0x40000000;
      const lX8 = lX & 0x80000000;
      const lY8 = lY & 0x80000000;
      const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
      return lResult ^ lX8 ^ lY8;
    };

    const F = (x, y, z) => (x & y) | (~x & z);
    const G = (x, y, z) => (x & z) | (y & ~z);
    const H = (x, y, z) => x ^ y ^ z;
    const I = (x, y, z) => y ^ (x | ~z);

    const FF = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
    const GG = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
    const HH = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
    const II = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

    const convertToWordArray = (str) => {
      const length = str.length;
      const totalWords = (((length + 8) >>> 6) + 1) * 16;
      const wordArray = new Array(totalWords).fill(0);
      for (let i = 0; i < length; i += 1) {
        wordArray[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
      }
      wordArray[length >> 2] |= 0x80 << ((length % 4) * 8);
      wordArray[totalWords - 2] = length * 8;
      return wordArray;
    };

    const utf8Encode = (string) => unescape(encodeURIComponent(string));
    let x = [];
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    const S11 = 7;
    const S12 = 12;
    const S13 = 17;
    const S14 = 22;
    const S21 = 5;
    const S22 = 9;
    const S23 = 14;
    const S24 = 20;
    const S31 = 4;
    const S32 = 11;
    const S33 = 16;
    const S34 = 23;
    const S41 = 6;
    const S42 = 10;
    const S43 = 15;
    const S44 = 21;

    x = convertToWordArray(utf8Encode(message));

    for (let k = 0; k < x.length; k += 16) {
      const AA = a;
      const BB = b;
      const CC = c;
      const DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    const wordToHex = (value) => {
      let hex = '';
      for (let i = 0; i <= 3; i += 1) {
        const byte = (value >>> (i * 8)) & 0xff;
        hex += byte.toString(16).padStart(2, '0');
      }
      return hex;
    };
    return `${wordToHex(a)}${wordToHex(b)}${wordToHex(c)}${wordToHex(d)}`;
  };

  const digestMessage = async (algo, message) => {
    if (algo === 'md5') return md5(message);
    const data = encoder.encode(message);
    const name = algo === 'sha1' ? 'SHA-1' : algo === 'sha256' ? 'SHA-256' : 'SHA-512';
    const hash = await crypto.subtle.digest(name, data);
    return bufferToHex(hash);
  };

  const renderHashList = (items) => {
    hashList.innerHTML = '';
    if (!items.length) {
      hashList.innerHTML = '<p class="helper-text">Enter text above and generate hashes.</p>';
      return;
    }
    items.forEach(({ label, value }) => {
      const row = document.createElement('div');
      row.className = 'hash-row';
      const labelSpan = document.createElement('span');
      labelSpan.className = 'hash-label';
      labelSpan.textContent = label;
      const valueSpan = document.createElement('span');
      valueSpan.className = 'hash-value';
      valueSpan.textContent = value;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'mini-copy';
      copyBtn.type = 'button';
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M9 9h11v11H9z" />
          <path d="M4 4h11v11H4z" />
        </svg>
      `;
      copyBtn.addEventListener('click', () => copyText(value, copyBtn));
      row.append(labelSpan, valueSpan, copyBtn);
      hashList.appendChild(row);
    });
  };

  let hashTimer = null;

  const runHashGeneration = async () => {
    const raw = hashInput.value.trim();
    if (!raw) {
      renderHashList([]);
      return;
    }
    const salted = `${raw}${saltInput.value}`;
    const selection = algoSelect.value;
    const algorithms = selection === 'all' ? ['md5', 'sha1', 'sha256', 'sha512'] : [selection];

    const results = [];
    for (const algo of algorithms) {
      // eslint-disable-next-line no-await-in-loop
      const value = await digestMessage(algo, salted);
      results.push({
        label: algo.toUpperCase(),
        value,
      });
    }

    renderHashList(results);
  };

  const scheduleHashGeneration = () => {
    if (hashTimer) {
      clearTimeout(hashTimer);
    }
    hashTimer = setTimeout(runHashGeneration, 180);
  };

  hashInput.addEventListener('input', scheduleHashGeneration);
  saltInput.addEventListener('input', scheduleHashGeneration);
  algoSelect.addEventListener('change', runHashGeneration);

  updateBulkButton();
  setBulkActive(false);
  updatePasswordPreview();
  renderHashList([]);
})();

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    
    // Buttons
    const btnU2B = document.getElementById('btn-u2b');
    const btnB2U = document.getElementById('btn-b2u');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');
    const swapBtn = document.getElementById('swap-btn');
    const micBtn = document.getElementById('mic-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadDocBtn = document.getElementById('download-doc-btn');
    const fileUpload = document.getElementById('file-upload');
    
    // Titles
    const leftTitle = document.getElementById('left-title');
    const rightTitle = document.getElementById('right-title');

    let currentMode = 'U2B';
    let convertTimeout;

    // Note: we intentionally do not show font-loading warnings in the UI.


    function applyFontsAndTitles() {
        if (currentMode === 'U2B') {
            leftTitle.innerText = "Unicode Input";
            rightTitle.innerText = "Bijoy Output";
            inputText.style.fontFamily = "'Nikosh', 'Inter', sans-serif";
            outputText.style.fontFamily = "SutonnyMJ, 'Inter', sans-serif";
            inputText.placeholder = "Type/paste Unicode Bangla here (Avro/Google keyboard)…";
            outputText.placeholder = "Bijoy output (needs SutonnyMJ font to display as Bangla)…";
        } else {
            leftTitle.innerText = "Bijoy Input";
            rightTitle.innerText = "Unicode Output";
            inputText.style.fontFamily = "SutonnyMJ, 'Inter', sans-serif";
            outputText.style.fontFamily = "'Nikosh', 'Inter', sans-serif";
            inputText.placeholder = "Type/paste Bijoy (SutonnyMJ) text here…";
            outputText.placeholder = "Unicode output will appear here…";
        }
    }

    function setMode(mode) {
        currentMode = mode;

        if (mode === 'U2B') {
            btnU2B.classList.add('active');
            btnB2U.classList.remove('active');
        } else {
            btnB2U.classList.add('active');
            btnU2B.classList.remove('active');
        }
        applyFontsAndTitles();
        convertText();
    }

    btnU2B.addEventListener('click', () => setMode('U2B'));
    btnB2U.addEventListener('click', () => setMode('B2U'));

    function convertText() {
        const val = inputText.value;
        if (!val.trim()) {
            outputText.value = '';
            return;
        }

        clearTimeout(convertTimeout);
        outputText.placeholder = "Converting... Please wait...";

        convertTimeout = setTimeout(() => {
            try {
                if (currentMode === 'U2B') {
                    // 1) User inputs Unicode → output Bijoy
                    if (typeof ConvertToASCII !== 'undefined') {
                        outputText.value = ConvertToASCII('bijoy', val);
                    } else if (window.BanglaConverterFactory?.toBijoy) {
                        outputText.value = window.BanglaConverterFactory.toBijoy(val);
                    } else {
                        outputText.value = val;
                    }
                } else {
                    // 2) User inputs Bijoy → output Unicode
                    if (typeof ConvertToUnicode !== 'undefined') {
                        outputText.value = ConvertToUnicode('bijoy', val);
                    } else if (window.BanglaConverterFactory?.toUnicode) {
                        outputText.value = window.BanglaConverterFactory.toUnicode(val);
                    } else {
                        outputText.value = val;
                    }
                }
            } catch (e) {
                outputText.value = "Error executing converter: " + e.message + "\nStack: " + e.stack;
            } finally {
                outputText.placeholder = "Converted text will appear here...";
            }
        }, 120);
    }

    inputText.addEventListener('input', convertText);

    swapBtn.addEventListener('click', () => {
        const left = inputText.value;
        const right = outputText.value;
        // Swap text areas and direction
        inputText.value = right;
        outputText.value = left;
        setMode(currentMode === 'U2B' ? 'B2U' : 'U2B');
    });

    btnClear.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    btnCopy.addEventListener('click', async () => {
        if (!outputText.value) return;
        try {
            await navigator.clipboard.writeText(outputText.value);
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { btnCopy.innerHTML = originalText; }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    });

    // Voice to Text
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        let recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'bn-BD';
        let isRecording = false;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) {
                // Voice typing is always Unicode Bangla from browser recognition.
                // Put it into Unicode mode input for predictable results.
                if (currentMode !== 'U2B') setMode('U2B');
                inputText.value += (inputText.value ? ' ' : '') + finalTranscript;
                convertText();
            }
        };

        recognition.onerror = (event) => { console.error(event.error); stopRecording(); };
        recognition.onend = () => stopRecording();

        function stopRecording() {
            isRecording = false;
            micBtn.classList.remove('recording');
        }

        micBtn.addEventListener('click', () => {
            if (isRecording) { recognition.stop(); } 
            else { recognition.start(); }
        });
    } else {
        micBtn.style.display = 'none';
    }

    // Document Upload (.txt, .docx, strict blocking of .doc/.pdf)
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const originalFileName = file.name.toLowerCase();
        
        if (originalFileName.endsWith('.doc')) {
            alert("Older .doc format is NOT natively supported by browsers.\n\nPlease open your file in Microsoft Word and click 'Save As -> Word Document (*.docx)' or 'Plain Text (*.txt)' and upload that!");
            fileUpload.value = '';
            return;
        }

        if (originalFileName.endsWith('.pdf')) {
            alert("PDF files are not supported directly. Please copy the text or upload as .docx/.txt!");
            fileUpload.value = '';
            return;
        }

        // Show Analyzing state
        inputText.value = "Analyzing document... Please wait.";

        if (originalFileName.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                const arrayBuffer = loadEvent.target.result;
                if(typeof mammoth !== 'undefined') {
                    mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                    .then(function(result) {
                        let text = result.value.replace(/<\/p>|<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/\n\n+/g, '\n\n').trim();
                        inputText.value = text;
                        convertText();
                    }).catch(function(err) {
                        inputText.value = "";
                        alert("Error reading DOCX file: " + err.message);
                    });
                } else {
                    inputText.value = "";
                    alert("DOCX parser (Mammoth) resolving error. Please check your internet connection.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Assume .txt or similar
            const reader = new FileReader();
            reader.onload = (e) => {
                inputText.value = e.target.result;
                convertText();
            };
            reader.readAsText(file, currentMode === 'B2U' ? 'windows-1252' : 'UTF-8');
        }
        fileUpload.value = ''; // Reset
    });

    // Download Document
    downloadBtn.addEventListener('click', () => {
        if (!outputText.value) return alert('No text to download!');
        
        // Let's create an MS Word compatible standard document
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Converted Document</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + outputText.value.replace(/\n/g, '<br>') + footer;

        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword;charset=utf-8' });
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `Bangla_Converted_${Date.now()}.doc`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 0);
    });

    // Ensure correct initial fonts for default mode
    applyFontsAndTitles();
    convertText();
});


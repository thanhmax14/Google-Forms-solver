const askGPT = async (question = "", options = [], ind = 0) => {
  try {
    const response = await fetch("https://buymnm.online/api/gemini/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        options: options,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error({ msg: "Lỗi từ Gemini API", error: data.error });
      return null;
    }

    return data.answer?.trim() ?? "";
  } catch (error) {
    console.error({ msg: "Lỗi khi gọi Gemini", error });
    return null;
  }
};

const changeAnswers = (type, question, answer) => {
  try {
    if (type === 0) {
      const input = question.querySelector("input.whsOnd.zHQkBf");
      if (input) input.value = answer;
    } else if (type === 1) {
      const textarea = question.querySelector("textarea.KHxj8b.tL9Q4c");
      if (textarea) textarea.value = answer;
    } else if (type === 2) {
      const options = question
        .querySelector("div.SG0AAe")
        .querySelectorAll("div.nWQGrd.zwllIb");

      const letterMap = { A: 0, B: 1, C: 2, D: 3 };
      const match = answer.trim().match(/[ABCD]/i);

      if (match) {
        const index = letterMap[match[0].toUpperCase()];
        if (options[index]) {
          options[index].querySelector("label").click();
        }
      }
    }
  } catch (error) {
    console.error({ msg: "Error when changing answer", error });
  }
};

const getAnswers = async () => {
  const questionElements = document.querySelectorAll("div.Qr7Oae");

  const solution = [];
  const questionData = [];
  let fullPrompt = "";

  questionElements.forEach((el, i) => {
    const questionText = el.querySelector(".HoXoMd .M7eMe")?.innerText?.trim() || `Câu hỏi ${i + 1}`;
    const optionNodes = el.querySelectorAll(".nWQGrd.zwllIb");
    const options = Array.from(optionNodes).map(opt => opt.innerText.trim());

    questionData.push({
      index: i,
      element: el,
      type: 2,
      questionText,
    });

    fullPrompt += `Câu hỏi ${i + 1}: ${questionText}\n`;
    options.forEach(opt => (fullPrompt += `${opt}\n`));
    fullPrompt += `\n`;
  });

  fullPrompt += `Chỉ trả lời đáp án đúng nhất cho mỗi câu, định dạng:\n`;
  questionData.forEach((_, i) => {
    fullPrompt += `Câu ${i + 1}: [A/B/C/D]\n`;
  });

  const answerString = await askGPT(fullPrompt, [], 0);
  if (!answerString) return;

  const parsedAnswers = {};
  const lines = answerString.split("\n");
  lines.forEach(line => {
    const match = line.match(/Câu\s*(\d+):\s*\[([ABCD])\]/i);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const letter = match[2].toUpperCase();
      parsedAnswers[index] = letter;
    }
  });

  for (const item of questionData) {
    const answer = parsedAnswers[item.index] || "?";

    solution.push({
      ind: item.index,
      questionText: item.questionText,
      answer: answer,
    });

    const node = document.createElement("span");
    node.classList.add("answer_quiz_gpt");
    node.innerText = answer;
    item.element.insertBefore(node, item.element.firstChild);

    changeAnswers(item.type, item.element, answer);
  }

  solution.sort((a, b) => a.ind - b.ind);
};

const toggleAnswers = () => {
  const answers = document.getElementsByClassName("answer_quiz_gpt");
  Array.from(answers).forEach((el) => {
    el.style.display = el.style.display === "none" ? "block" : "none";
  });
};

const deleteAnswers = () => {
  const answers = document.getElementsByClassName("answer_quiz_gpt");
  Array.from(answers).forEach((el) => el.parentElement.removeChild(el));
};

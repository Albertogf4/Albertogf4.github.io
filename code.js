/*Estilos para elementos del js*/
const styles = `


.options {
  margin-top: 20px;
}

.options div {
  margin-bottom: 5px;
}

button {
  padding: 10px; 
  width:300px; 
  border-radius: 5px;
  transition: transform 0.2s;
}

button:hover {
  cursor: pointer;
  transform: scale(1.1);
}

.correct {
 background-color: #67d467; 
}

.incorrect {
 background-color: #cb5555; 
}


`;

class Pregunta extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
  }

  async connectedCallback() {
    await this.generateQuestions();
    this.displayQuestion();
  }

  async generateQuestions() {
    for (let i = 0; i < 10; i++) {
      const quoteData = await this.getQuote();
      const correctAuthor = quoteData.author;
      const incorrectAuthors = [];

      // Autores incorrectos
      while (incorrectAuthors.length < 3) {
        const otherQuoteData = await this.getQuote();
        const otherAuthor = otherQuoteData.author;
        if (otherAuthor !== correctAuthor && !incorrectAuthors.includes(otherAuthor)) {
          incorrectAuthors.push(otherAuthor);
        }
      }

      const allAuthors = [correctAuthor, ...incorrectAuthors];
      const shuffledAuthors = this.shuffleArray(allAuthors);

      const question = {
        content: `"${quoteData.content}"`,
        correctAnswer: correctAuthor,
        options: shuffledAuthors
      };

      this.questions.push(question);
    }
  }

  displayQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <h2>¿De quién crees que es la siguiente cita?</h2>
      <div class="preguntas">${question.content}</div>
      <div class="options">${question.options.map((option) => `
        <div>
          <button class="optionBtn" value="${option}"> ${option}</button>
        </div>`).join('')}
      </div>
    `;
    this.addEventListeners();
  }

  addEventListeners() {
    const optionBtns = this.shadowRoot.querySelectorAll('.optionBtn');
    optionBtns.forEach(button => {
      button.addEventListener('click', () => {
        const selectedAnswer = button.value;
        const correctAnswer = this.questions[this.currentQuestionIndex].correctAnswer;
        if (selectedAnswer === correctAnswer) {
          button.classList.add('correct');
          this.correctAnswers++;
        } else {
          button.classList.add('incorrect');
        }
        setTimeout(() => {
          this.currentQuestionIndex++;
          if (this.currentQuestionIndex < 10) {
            this.displayQuestion();
          } else {
            this.showResult();
          }
        }, 1000); // Espera 
      });
    });
  }

  showResult() {
    let result;
    if (this.correctAnswers >= 8) {
      result = "¡Enhorabuena!";
    } else if (this.correctAnswers >= 5) {
      result = "¡Buen trabajo!";
    } else {
      result = "¡Sigue practicando!";
    }
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <h2>Resultados</h2>
      <p>Respuestas correctas: ${this.correctAnswers} / 10</p>
      <p>${result}</p>
      <button id="replayButton">Volver a jugar</button>
    `;
    this.shadowRoot.getElementById('replayButton').addEventListener('click', function() {
      location.reload();
    });
  } 

  async getQuote() {
    document.getElementById('preguntas').classList.add('hidden');
    document.getElementById('carga').classList.remove('hidden');
    const response = await fetch('https://api.quotable.io/random');
    const data = await response.json();
    document.getElementById('carga').classList.add('hidden');
    document.getElementById('preguntas').classList.remove('hidden');

    return data;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

customElements.define('elemento-pregunta', Pregunta);


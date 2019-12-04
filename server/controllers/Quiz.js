const models = require('../models');

const Quiz = models.Quiz;

// store a quiz in the database with the given name/description/questions/outcomes
const createQuiz = (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.questions || !req.body.outcomes) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  const quizData = {
    name: req.body.name,
    description: req.body.description,
    owner: req.session.account._id,
    questions: req.body.questions,
    outcomes: req.body.outcomes,
  };

  const newQuiz = new Quiz.QuizModel(quizData);

  const quizPromise = newQuiz.save();

  quizPromise.then(() => res.json({ redirect: '/' }));

  quizPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  });

  return quizPromise;
};

const deleteQuiz = (req, res) => {
  if (!req.body.quizId) {
    return res.status(400).json({ error: 'Missing quiz id' });
  }

  return Quiz.QuizModel.deleteQuiz(req.body.quizId, req.session.account._id, (doc) => {
    console.log(doc);
    if (!doc || !doc.deletedCount || doc.deletedCount !== 1) {
      return res.status(400).json({ error: 'Failed to delete quiz' });
    }
    return res.status(204);
  });
};

// returns makeQuiz view
const makeQuizPage = (req, res) => res.render('makeQuiz', { csrfToken: req.csrfToken() });

// returns takeQuiz view with the given quiz name and description
const takeQuizPage = (req, res) => {
  if (!req.query.quizName || !req.query.quizDescription || !req.query.quizId) {
    return res.status(400).json({ error: 'Missing name, description, or id' });
  }

  return res.render('takeQuiz', {
    csrfToken: req.csrfToken(), quizName: req.query.quizName,
    quizDescription: req.query.quizDescription, quizId: req.query.quizId,
  });
};

// returns a quiz from the database with the given name and description
const getQuiz = (req, res) => {
  if (!req.query.quizId) {
    return res.status(400).json({ error: 'Missing quiz id' });
  }

  return Quiz.QuizModel.findById(req.query.quizId, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.status(200).json({ quiz: doc[0] });
  });
};

// returns all quizzes from the database
const getQuizzes = (req, res) => {
  if (req.query.filterByOwner) {
    return Quiz.QuizModel.findByOwner(req.session.account._id, (err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
      }

      return res.status(200).json({ quizzes: docs });
    });
  }
  return Quiz.QuizModel.getAllQuizzes((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ quizzes: docs });
  });
};

module.exports.createQuiz = createQuiz;
module.exports.makeQuizPage = makeQuizPage;
module.exports.takeQuizPage = takeQuizPage;
module.exports.getQuizzes = getQuizzes;
module.exports.getQuiz = getQuiz;
module.exports.deleteQuiz = deleteQuiz;

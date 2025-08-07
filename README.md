# 📚 Daily English App

An interactive mobile learning app to boost your English daily — inspired by _LinkedIn’s “Today’s Puzzles”_, but focused on reading, vocabulary, and grammar.

Built with **React Native (Expo)** and powered by **AWS Serverless** + **OpenAI**, it delivers fresh content and quizzes every day.

---

## ✨ Key Features

- **Daily AI-Generated Passage** – Unique, varied difficulty using OpenAI.
- **Auto-Generated Quizzes** – Comprehension, vocabulary, and grammar checks.
- **Multiple Login Options** – Google or native signup (username, email, phone) via AWS Cognito.
- **Progress Tracking** – Results stored in AWS DynamoDB.
- **Personalized Tips** – Vocabulary & grammar suggestions after quizzes.
- **Fully Serverless Backend** – AWS Lambda + API Gateway for speed & scalability.

---

## 🛠 Tech Stack

- **Frontend** – React Native (Expo), Styled Components
- **Backend** – AWS Lambda, API Gateway
- **Database** – AWS DynamoDB
- **Auth** – AWS Cognito (Google + native)
- **AI** – OpenAI API for passages & quizzes
- **Infra** – 100% serverless AWS

---

## 🎯 Vision

Transform daily English learning into a **quick, fun 5–10 min habit**.  
Whether for exams, work, or personal growth — this app makes progress **consistent, interactive, and AI-powered**.

---

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Update aws-exports.js

   ```bash
   cp src/aws-exports.example.js src/aws-exports.js
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

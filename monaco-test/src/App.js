import logo from "./logo.svg";
import "./App.css";
import React, { Component, useState } from "react";
import MonacoEditor from "react-monaco-editor";
const exampleCode = `

// Define Typescript Interface Employee
interface Employee {
    firstName: String;
    lastName: String;
    contractor?: Boolean;
}

// Use Typescript Interface Employee. 
// This should show you an error on john 
// as required attribute lastName is missing
const john:Employee = {
    firstName:"John",
    // lastName:"Smith"
    // contractor:true
}

`;
function App() {
  const [code, updateCode] = useState(exampleCode);
  return (
    <MonacoEditor
      width="600"
      height="800"
      language="typescript"
      theme="vs-dark"
      defaultValue=""
      value={code}
      onChange={updateCode}
    />
  );
}

export default App;

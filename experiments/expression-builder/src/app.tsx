import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import { generateTree, stringToSourceFile } from "./parser";

const App = (props: { message: string }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => {
    setCount((count) => count + 1);
  }, [count]);
  return (
    <>
      <h1>{props.message}</h1>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </>
  );
};

const Tree = ({ tree: [parent, children] }: { tree: [string, string[]] }) => {
  switch (parent) {
    case "IfStatement":
      const [condition, statement] = children;
      return (
        <li>
          <div>
            <h3>{parent}</h3>
            Condition: <code>{condition}</code><br/>
            Statement: <Tree tree={statement} />
          </div>
        </li>
      );
    default:
      return (
        <li>
          {parent}
          <ul>
            {children.map((c) => (
              <Tree tree={c} />
            ))}
          </ul>
        </li>
      );
  }
};

const code = "if(true){alert('foo')}";
const tree: string[][] = generateTree(stringToSourceFile(code))[0];

ReactDOM.render(
  <>
    <textarea id="story" name="story" rows="5" cols="33">
      {code}
    </textarea>
    <Tree tree={tree} />
  </>,
  document.getElementById("root")
);

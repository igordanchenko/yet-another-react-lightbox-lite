import { useState } from "react";

import Lightbox from "../src";
import "../src/styles.scss";

import slides from "./slides";

export default function App() {
  const [index, setIndex] = useState<number>();

  return (
    <main className="centered">
      <Lightbox slides={slides} index={index} setIndex={setIndex} />

      <button type="button" className="button" onClick={() => setIndex(0)}>
        Open Lightbox
      </button>
    </main>
  );
}

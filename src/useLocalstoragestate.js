import { useState, useEffect } from "react";

export default function useLocalstoragestate(i, key) {
  const [value, setvalue] = useState(function () {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : i;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key],
  );
  return [value, setvalue];
}

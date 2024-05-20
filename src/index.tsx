import React from 'react';
import ReactDOM from 'react-dom/client'; // 수정된 임포트 경로
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');

if (rootElement) {
  // 'root' DOM 노드에 대한 루트를 생성합니다.
  const root = ReactDOM.createRoot(rootElement);

  // 루트 렌더링을 수행합니다.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // 서비스 워커를 등록합니다.
  serviceWorkerRegistration.register();
} else {
  console.error("Failed to find the root element. Make sure the element with id 'root' exists in your HTML.");
}

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { useInitAuth } from "@/hooks/useInitAuth";

function App({ Component, pageProps }) {
  useInitAuth();

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;

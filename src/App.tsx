import {
  useCallback,
  useState,
  type ReactElement,
  type FormEventHandler,
  type ChangeEventHandler,
} from "react";
import * as classes from "./App.module.css";

const endpoint = "https://just-obey-1002.authgear-staging.com";

class AppError extends Error {
  responseBody: any;

  constructor(message: string, responseBody: any) {
    super(message);
    this.responseBody = responseBody;
  }

  toString(): string {
    return `AppError: ${this.message} ${JSON.stringify(this.responseBody)}`;
  }
}

async function signIn(email: string, password: string): Promise<string> {
  // Forward any necessary query parameter.
  const url = `${endpoint}/api/v1/authentication_flows${window.location.search}`;
  const body = {
    flow_reference: {
      type: "login_flow",
      id: "default",
    },
    batch_input: [
      {
        identification: "email",
        login_id: email,
      },
      {
        authentication: "primary_password",
        password,
      },
    ],
  };
  const response = await fetch(url, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseBody = await response.json();
  const finish_redirect_uri = responseBody?.result?.data?.finish_redirect_uri;
  if (typeof finish_redirect_uri === "string") {
    return finish_redirect_uri;
  }
  throw new AppError("unexpected response", responseBody);
}

export default function App(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setEmail(e.currentTarget.value);
    },
    []
  );

  const onChangePassword: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setPassword(e.currentTarget.value);
    },
    []
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      signIn(email, password).then(
        (url) => {
          window.location.href = url;
        },
        (e) => {
          console.error(e);
          setError(e);
        }
      );
    },
    [email, password]
  );

  return (
    <div className={classes.app}>
      <form className={classes.form} onSubmit={onSubmit} noValidate={true}>
        <div className={classes.field}>
          <label className={classes.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={classes.input}
            placeholder="Enter your email"
            value={email}
            onChange={onChangeEmail}
          />
        </div>
        <div className={classes.field}>
          <label className={classes.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={classes.input}
            placeholder="Enter your password"
            value={password}
            onChange={onChangePassword}
          />
        </div>
        <button type="submit" className={classes.button}>
          Submit
        </button>
        {error != null ? <pre className={classes.pre}>{`${error}`}</pre> : null}
      </form>
    </div>
  );
}

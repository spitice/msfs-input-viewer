
import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";

import {
    inputViewerEpic,
    inputViewerReducer,
} from "./inputViewer/slice";

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
    reducer: inputViewerReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
        epicMiddleware as any
    ),
    devTools: false,
});

epicMiddleware.run( inputViewerEpic as any );

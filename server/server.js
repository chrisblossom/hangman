import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import compression from 'compression';
import SocketIO from 'socket.io';
import setupStore from 'server/store';
import connectDB from 'server/config/db';
import configIO from 'server/socket';
import router from 'server/router';
import { PORT } from 'server/config/constant';

const MARK = `server started on port ${PORT}`;
console.time(MARK);
const app = express();
const server = http.Server(app);
const io = SocketIO(server);
const store = setupStore();
const db = connectDB();

if (process.env.NODE_ENV !== 'production') {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('config/webpack.dev');
	const compiler = webpack(webpackConfig);
	app.use(webpackHotMiddleware(compiler));
	app.use(webpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath: webpackConfig.output.publicPath
	}));
	const morgan = require('morgan');
	app.use(morgan('dev'));
}
else {
	const helmet = require('helmet');
	app.use(helmet());
}

configIO(io, store, app);
app.use(cors());
app.use(compression());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/../client`));
app.use(router);
server.listen(PORT, () => console.timeEnd(MARK));
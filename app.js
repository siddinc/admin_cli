'use strict';

const mongoose = require('mongoose');
const inquirer = require('inquirer');
const Admin = require('./models/admin');
const shortUuid = require('short-uuid');

const DB_CONNECTION_URL = 'mongodb://localhost:27017/test_db';

async function adminOperations() {
	let adminOperationAnswers;
	let adminOperationQuestions = [
		{
			type: 'list',
			name: 'operation',
			message: 'Choose admin operation to be performed:',
			choices: ['add', 'delete', 'show', 'exit'],
		},
	];
	let run = true;

	try {
		await mongoose.connect(DB_CONNECTION_URL, { useNewUrlParser: true });
		console.log({ status: 'DB connection successful' });
	} catch (error) {
		return console.log({
			status: 'DB connection unsuccessful',
			error: error,
		});
	}

	while (run) {
		try {
			adminOperationAnswers = await inquirer.prompt(adminOperationQuestions);
		} catch (error) {
			return console.log(error);
		}

		switch (adminOperationAnswers.operation) {
			case 'add': {
				let admin, adminCreate, addAdminAnswers;
				const addAdminQuestions = [
					{
						type: 'input',
						name: 'adminName',
						message: 'Enter admin name:',
					},
				];

				try {
					addAdminAnswers = await inquirer.prompt(addAdminQuestions);
				} catch (error) {
					return console.log(error);
				}

				if (addAdminAnswers.adminName.length === 0) {
					console.log({ message: 'Admin name not provided' });
				} else {
					try {
						admin = await Admin.findOne({
							adminName: addAdminAnswers.adminName,
						});
					} catch (error) {
						return console.log(error);
					}

					if (admin) {
						console.log({ message: 'Admin name not available' });
					} else {
						try {
							adminCreate = await Admin.create({
								adminName: addAdminAnswers.adminName,
								adminId: shortUuid.generate(),
							});
							console.log({
								message: 'New admin created successfully',
								admin: {
									'admin name': adminCreate.adminName,
									'admin ID': adminCreate.adminId,
								},
							});
						} catch (error) {
							return console.log(error);
						}
					}
				}

				break;
			}

			case 'delete': {
				let deleteAdminAnswers, adminDelete;
				const deleteAdminQuestions = [
					{
						type: 'input',
						name: 'adminName',
						message: 'Enter admin name:',
					},
					{
						type: 'input',
						name: 'adminId',
						message: 'Enter admin ID:',
					},
				];

				try {
					deleteAdminAnswers = await inquirer.prompt(deleteAdminQuestions);
					console.log(deleteAdminAnswers);
				} catch (error) {
					return console.log(error);
				}

				if (
					deleteAdminAnswers.adminName.length === 0 ||
					deleteAdminAnswers.adminId.length === 0
				) {
					console.log({ message: 'Admin ID / name pair not provided' });
				} else {
					try {
						adminDelete = await Admin.findOneAndDelete({
							adminName: deleteAdminAnswers.adminName,
							adminId: deleteAdminAnswers.adminId,
						});
					} catch (error) {
						return console.log(error);
					}

					if (adminDelete === null) {
						console.log({ message: 'Admin does not exist' });
					} else {
						console.log({ message: 'Admin was deleted successfully' });
					}
				}

				break;
			}

			case 'show': {
				let admin, showAdminAnswers;
				const showAdminQuestions = [
					{
						type: 'input',
						name: 'adminAttr',
						message: 'Enter admin ID or name:',
					},
				];

				try {
					showAdminAnswers = await inquirer.prompt(showAdminQuestions);
				} catch (error) {
					return console.log(error);
				}

				if (showAdminAnswers.adminAttr.length === 0) {
					console.log({ message: 'Admin ID or name not provided' });
				} else {
					try {
						admin = await Admin.findOne({
							$or: [
								{ adminName: showAdminAnswers.adminAttr },
								{ adminId: showAdminAnswers.adminAttr },
							],
						});
					} catch (error) {
						return console.log(error);
					}

					if (admin === null) {
						console.log({ message: 'Admin does not exist' });
					} else {
						console.log({
							message: 'Admin data retrieved successfully',
							admin: {
								'admin name': admin.adminName,
								'admin ID': admin.adminId,
							},
						});
					}
				}

				break;
			}

			case 'exit': {
				run = false;
				break;
			}
		}
	}

	return 0;
}

if (typeof module !== 'undefined' && !module.parent) {
	const sig = adminOperations();
	sig
		.then(() => {
			process.exit(0);
		})
		.catch(error => {
			console.log({ error: error });
			process.exit(1);
		});
}

'use strict';

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
	{
		adminId: {
			type: String,
			required: true,
		},
		adminName: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);

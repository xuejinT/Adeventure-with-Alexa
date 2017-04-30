var processUtterance = require('./processUtterance')

module.exports = {
	"ResetStateIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "reset skill" )
	},
	"RestoreStateIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "resume skill" )
	},
	"RepeatOptionsIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "repeat options" )
	},
	"RepeatSceneIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "repeat scene" )
	},
	"GoBackIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "go back" )
	},
	"AMAZON.HelpIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "help" )
	},
	"AMAZON.StopIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "exit skill" )
	},
	"AMAZON.CancelIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "exit skill" )
	},
	"StarWarsIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "star wars" )
	},
	"LifelineIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "lifeline" )
	},
	"OpenDoorIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "open door" )
	},
	"MasterYodaIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "master yoda" )
	},
	"MasterAnakinIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "master anakin" )
	},
	"HeavyLightsaberIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "heavy lightsaber" )
	},
	"LightLightsaberIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "light lightsaber" )
	},
	"LongLightsaberIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "long lightsaber" )
	},
	"ShortLightsaberIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "short lightsaber" )
	},
	"YesIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "yes" )
	},
	"WhatHappenedIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "what happened" )
	},
	"AreYouAlrightIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "are you alright" )
	},
}
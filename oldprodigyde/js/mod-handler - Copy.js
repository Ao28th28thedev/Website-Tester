/*
	Simple mod interface for Prodigy version 1-11-0
	
	Installed Mods: 
		
		| Mod Name |               	| Author |
		
		Walk Speed 					Daboss7173
		Fast Game Speed				Daboss7173
		Classic Faces				Daboss7173
		Classic Faces For Boys		XPMUser
		CoyBlush				    XPMUser
	
	Written by: Daboss7173 & XPMUser
	Github: https://github.com/Daboss7173/Daboss7173.github.io
	Github: https://github.com/XPMUser/XPMUser.github.io
*/
class ModHandler {
	constructor(e) {
		this.game = e;
		this.animations = new class {
			constructor() {
				this.animations = []
			}
			getAll() {
				let e = [];
				for (let t = 0; t < this.animations.length; t++) e.push(this.animations[t].animation);
				return e
			}
			register(e, t) {
				this.animations.push({
					animation: e,
					baseSpeed: t
				})
			}
			clear() {
				this.animations = []
			}
		};
		this.available = [{
				id: "WalkSpeed",
				patch: "initWalkSpeedMod"
			}, {
				id: "FastGameSpeed",
				patch: "initFastGameSpeedMod"
			}, {
				id: "ClassicFaces",
				patch: "initClassicFaceMod"
			}, {
				id: "ClassicFacesForBoys",
				patch: "initClassicFaceForBoysMod"
			}, {
				id: "CoyBlush",
				patch: "initCoyBlushMod"
			}]
	}
	
	log(e) {
		Util.isDefined(e) && console.log("%c %c %c " + e + " %c %c ", "background: #1724", "background: #172a", "background: #172f; color: #FFF", "background: #172a", "background: #1724")
	}
	
	info(e) {
		Util.isDefined(e) && console.log("%c %c %c " + e + " %c %c ", "background: #14b4", "background: #14ba", "background: #14bf; color: #FFF", "background: #14ba", "background: #14b4")
	}
	
	error(e) {
		Util.isDefined(e) && console.log("%c %c %c " + e + " %c %c ", "background: #a114", "background: #a11a", "background: #a11f; color: #FFF", "background: #a11a", "background: #a114")
	}
	
	initWalkSpeedMod() {
		this.game.prodigy.player.walkSpeed = 1,
		Prodigy.Container.CreatureContainer.prototype.setPath = function (e, t, i) {
			if (Util.isDefined(e)) {
				this.game.tweens.removeFrom(this, !1), this.game.tweens.removeFrom(this.sprites), Util.isDefined(i) || (i = this.game.prodigy.player.walkSpeed);
				for (var a = null, s = null, r = this.x, o = this.y, n = e.length - 1; n >= 0; n--) {
					var h = e[n];
					Util.isDefined(h.x) || (h.x = r), Util.isDefined(h.y) || (h.y = o);
					var l = this.game.prodigy.math.distance(h.x, h.y, r, o);
					0 !== l && (Util.isDefined(a) || (a = this.game.add.tween(this), s = this.game.add.tween(this.sprites.scale)), a.to({
						x: h.x,
						y: h.y
					}, 6 * l / i, Phaser.Easing.Linear.None), s.to({
						x: h.x > r ? 1 : -1
					}, 1, Phaser.Easing.Linear.None), s.to({}, 6 * l / i - 100, Phaser.Easing.Linear.None), r = h.x, o = h.y)
				}
				Util.isDefined(a) ? (a.onComplete.addOnce(this.stand, this), Util.isDefined(t) && a.onComplete.addOnce(t), this.walk(), this.mode = 0, Util.isDefined(a) && a.start(), Util.isDefined(s) && s.start()) : (Util.isDefined(t) && t(), this.stand())
			}
		};
		Prodigy.Menu.SystemMenu.prototype.openOther = function () {
			this.game.prodigy.create.textButton(this.content, 150, 50, {
				text: "Watch Intro",
				size: Prodigy.Control.TextButton.MED
			}, this.openIntro.bind(this)), this.game.prodigy.create.textButton(this.content, 150, 125, {
				text: "Toggle Member",
				size: Prodigy.Control.TextButton.MED
			}, this.toggleMember.bind(this)),
			this.walkSpeedBar = this.game.prodigy.create.slider(this.content, 37, 215, 525, !1, !1),
			this.walkSpeedBar.reset(200, 0, Math.floor((this.game.prodigy.player.walkSpeed - 0.1) * 10), this.setWalkSpeed.bind(this))
		};
		Prodigy.Menu.SystemMenu.prototype.setWalkSpeed = function () {
			this.game.prodigy.player.walkSpeed = (this.walkSpeedBar.page + 1) / 10,
			this.game.prodigy.create.font(this.content, 37, 185, "Walk Speed", {
				width: 525,
				align: "center"
			})
		}
	}
	
	initFastGameSpeedMod() {
		var e = Phaser.TweenManager.prototype.add,
			t = this.game,
			i = Phaser.Timer.prototype.add,
			a = Phaser.Tween.prototype.delay,
			s = Phaser.Tween.prototype.to,
			r = (Boot.prototype.update, Phaser.AnimationManager.prototype.play),
			n = Phaser.AnimationManager.prototype.add,
			l = Phaser.Game.prototype.update,
			d = this.animations;
		Phaser.Game.prototype.update = function(e) {
			for (let e = 0; e < d.animations.length; e++) !Util.isDefined(d.animations[e].animation._parent) && d.animations.splice(e, 1);
			return l.call(this, e)
		}, window.setGameSpeed = function(l) {
			var g = l;
			if (g < .1) ModHooks.error("Supplied speed multiplier is too low. Try a larger speed value.");
			else {
				if (Phaser.TweenManager.prototype.add = function(t) {
						t.timeScale = g, e.call(this, t)
					}, Phaser.Timer.prototype.add = function(e, t, a) {
						return e /= g, i.call(this, e, t, a)
					}, Phaser.Tween.prototype.delay = function(e, t) {
						return e /= g, a.call(this, e, t)
					}, Phaser.Tween.prototype.to = function(e, t, i, a, r, o, n) {
						return Util.isDefined(r) && (r /= g), s.call(this, e, t, i, a, r, o, n)
					}, Phaser.AnimationManager.prototype.add = function(e, t, i, a, s) {
						let r = 10;
						Util.isDefined(i) && (r = i, i *= g);
						let o = n.call(this, e, t, i, a, s);
						return d.register(o, r), o
					}, Phaser.AnimationManager.prototype.play = function(e, t, i, a) {
						return Util.isDefined(t) && !isNaN(t) && (t *= g), r.call(this, e, t, i, a)
					}, Util.isDefined(t.tweens))
					for (var c = t.tweens.getAll(), p = 0; p < c.length; p++) c[p].timeScale = g;
				if (Util.isDefined(d))
					for (var u = d.getAll(), m = 0; m < u.length; m++) u[m].speed = g * (Util.isDefined(d.animations[m].baseSpeed) ? d.animations[m].baseSpeed : 10);
			}
		}, window.setGameSpeed(3), setTimeout((() => {
			this.info('Use "setGameSpeed(speed)" to change the game speed at anytime.')
		}), 1e3)
	}
	
	initClassicFaceMod() {
		var assets = this.game.assets.getAssetMap();
		assets.heads.base = "https://xpmuser.github.io/oldprodigy/1-10-0/assets/images/";
		
		PlayerContainer.getAssets = function(e, t, a) {
			var i = new Array;
			t = 1 === t ? "reduced" : "normal", Util.isDefined(a) || (a = e.equipment.getEquipment("outfit")), i.push(Util.isDefined(a) ? t + "-outfit-" + e.appearance.getGender() + "-" + a : null), i.push(t + "/face/" + e.appearance.getSkinColor()), i.push(t + "-hair-" + e.appearance.getGender() + "-" + e.appearance.getHairStyle() + "-" + e.appearance.getHairColor()), i.push(t + "/eyes/" + e.appearance.getGender() + "/" + e.appearance.getEyeColor()), i.push(Util.isDefined(e.equipment.getEquipment("hat")) ? t + "-hat-" + e.equipment.getEquipment("hat") : null), i.push("normal" === t && Util.isDefined(e.equipment.getEquipment("weapon")) ? t + "-weapon-" + e.equipment.getEquipment("weapon") : null), Util.isDefined(i[0]) || (i[0] = t + "-outfit-" + e.appearance.getGender() + "-13");
			var s = e.equipment.getEquipment("hat");
			if (Util.isDefined(s)) {
				var t = Items.getItemData("hat", s).type;
				("cover" === t || "wrap" === t) && (i[2] = null)
			}
			return i
		}
		
		PlayerContainer.prototype.setup = function() {
			if (Util.isDefined(this.assets)) {
				this.sprites.removeAll(!0);
				var e = this.assets[0],
					t = this.assets[1],
					a = this.assets[2],
					i = this.assets[3],
					s = this.assets[4],
					r = this.assets[5],
					o = this.game.assets.getImageBounds(e),
					n = Math.floor(-(64 * this.setScale - o[0])),
					h = -o[3];
				let isFemale = this.source.appearance.getGender() === "female";
				if (null !== t && (this.face = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? 93 : 44)), h - (o[1] - (1 != this.setScale ? 82 : 48)), "heads", t), this.sprites.add(this.face), this.faceY = this.face.y), null !== i && (this.eyes = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? (isFemale ? 115 : 113) : 55)), h - (o[1] - (1 != this.setScale ? (isFemale ? 117 : 114) : (isFemale ? 66 : 65))), "heads", i), this.sprites.add(this.eyes), this.eyesY = this.eyes.y), null !== a) {
					var l = this.game.assets.getImageBounds(a);
					this.hair = new Sprite(this.game, n - (o[0] - l[0]), h - (o[1] - l[1]), a), this.sprites.add(this.hair), this.hairY = this.hair.y, this.hair.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hair.animations.add("stand", [0], 10, !0, !0), this.hair.animations.add("fct", [0], 10, !0, !0)
				}
				if (null !== s) {
					var p = this.game.assets.getImageBounds(s);
					this.hat = new Sprite(this.game, n - (o[0] - p[0]), h - (o[1] - p[1]), s), this.sprites.add(this.hat), this.hatY = this.hat.y;
					var d = Items.getItemData("hat", this.source.equipment.getEquipment("hat"));
					Util.isDefined(d) && 1 === d.standAnimation ? (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("fct", [0, 1, 2, 3], 10, !0, !0)) : (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0], 10, !0, !0), this.hat.animations.add("fct", [0], 10, !0, !0))
				}
				if (this.body = new Sprite(this.game, n, h, e), this.sprites.add(this.body), this.animWalk = this.body.animations.add("walk", [0, 1, 2, 3, 4, 5, 6, 7], 10, !0, !0), this.animStand = this.body.animations.add("stand", [8, 9, 10, 11, 12, 13, 14, 15], 10, !0, !0), this.animFunction = this.body.animations.add("fct", [16, 17, 18, 19, 20, 21, 22, 23], 10, !0, !0), this.animFunction.onComplete.add(this.functionComplete.bind(this)), null !== r) {
					var u = this.game.assets.getImageBounds(r);
					this.weapon = new Sprite(this.game, n - (o[0] - u[0]), h - (o[1] - u[1]), r), this.sprites.add(this.weapon), this.weaponY = this.weapon.y
				}
				this.transforming && this.showSmoke(), this.sprites.callAll("play", null, "stand"), this.mode = 1, this.complete = !0, this.loading = !1
			}
		}
	}
	
	initClassicFacesForBoysMod() {
		var assets = this.game.assets.getAssetMap();
		assets.heads.base = "https://xpmuser.github.io/oldprodigy/pde1221/assets/images/general-2";
		
		PlayerContainer.getAssets = function(e, t, a) {
			var i = new Array;
			t = 1 === t ? "reduced" : "normal", Util.isDefined(a) || (a = e.equipment.getEquipment("outfit")), i.push(Util.isDefined(a) ? t + "-outfit-" + e.appearance.getGender() + "-" + a : null), i.push(t + "/face/" + e.appearance.getSkinColor()), i.push(t + "-hair-" + e.appearance.getGender() + "-" + e.appearance.getHairStyle() + "-" + e.appearance.getHairColor()), i.push(t + "/eyes/" + e.appearance.getGender() + "/" + e.appearance.getEyeColor()), i.push(Util.isDefined(e.equipment.getEquipment("hat")) ? t + "-hat-" + e.equipment.getEquipment("hat") : null), i.push("normal" === t && Util.isDefined(e.equipment.getEquipment("weapon")) ? t + "-weapon-" + e.equipment.getEquipment("weapon") : null), Util.isDefined(i[0]) || (i[0] = t + "-outfit-" + e.appearance.getGender() + "-13");
			var s = e.equipment.getEquipment("hat");
			if (Util.isDefined(s)) {
				var t = Items.getItemData("hat", s).type;
				("cover" === t || "wrap" === t) && (i[2] = null)
			}
			return i
		}
		
		PlayerContainer.prototype.setup = function() {
			if (Util.isDefined(this.assets)) {
				this.sprites.removeAll(!0);
				var e = this.assets[0],
					t = this.assets[1],
					a = this.assets[2],
					i = this.assets[3],
					s = this.assets[4],
					r = this.assets[5],
					o = this.game.assets.getImageBounds(e),
					n = Math.floor(-(64 * this.setScale - o[0])),
					h = -o[3];
				let isFemale = this.source.appearance.getGender() === "female";
				if (null !== t && (this.face = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? 93 : 44)), h - (o[1] - (1 != this.setScale ? 82 : 48)), "heads", t), this.sprites.add(this.face), this.faceY = this.face.y), null !== i && (this.eyes = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? (isFemale ? 115 : 113) : 55)), h - (o[1] - (1 != this.setScale ? (isFemale ? 117 : 114) : (isFemale ? 66 : 65))), "heads", i), this.sprites.add(this.eyes), this.eyesY = this.eyes.y), null !== a) {
					var l = this.game.assets.getImageBounds(a);
					this.hair = new Sprite(this.game, n - (o[0] - l[0]), h - (o[1] - l[1]), a), this.sprites.add(this.hair), this.hairY = this.hair.y, this.hair.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hair.animations.add("stand", [0], 10, !0, !0), this.hair.animations.add("fct", [0], 10, !0, !0)
				}
				if (null !== s) {
					var p = this.game.assets.getImageBounds(s);
					this.hat = new Sprite(this.game, n - (o[0] - p[0]), h - (o[1] - p[1]), s), this.sprites.add(this.hat), this.hatY = this.hat.y;
					var d = Items.getItemData("hat", this.source.equipment.getEquipment("hat"));
					Util.isDefined(d) && 1 === d.standAnimation ? (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("fct", [0, 1, 2, 3], 10, !0, !0)) : (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0], 10, !0, !0), this.hat.animations.add("fct", [0], 10, !0, !0))
				}
				if (this.body = new Sprite(this.game, n, h, e), this.sprites.add(this.body), this.animWalk = this.body.animations.add("walk", [0, 1, 2, 3, 4, 5, 6, 7], 10, !0, !0), this.animStand = this.body.animations.add("stand", [8, 9, 10, 11, 12, 13, 14, 15], 10, !0, !0), this.animFunction = this.body.animations.add("fct", [16, 17, 18, 19, 20, 21, 22, 23], 10, !0, !0), this.animFunction.onComplete.add(this.functionComplete.bind(this)), null !== r) {
					var u = this.game.assets.getImageBounds(r);
					this.weapon = new Sprite(this.game, n - (o[0] - u[0]), h - (o[1] - u[1]), r), this.sprites.add(this.weapon), this.weaponY = this.weapon.y
				}
				this.transforming && this.showSmoke(), this.sprites.callAll("play", null, "stand"), this.mode = 1, this.complete = !0, this.loading = !1
			}
		}
	}

	initCoyBlushMod() {
		var assets = this.game.assets.getAssetMap();
		assets.heads.base = "https://xpmuser.github.io/oldprodigy/pde1221/assets/images/general-";
		
		PlayerContainer.getAssets = function(e, t, a) {
			var i = new Array;
			t = 1 === t ? "reduced" : "normal", Util.isDefined(a) || (a = e.equipment.getEquipment("outfit")), i.push(Util.isDefined(a) ? t + "-outfit-" + e.appearance.getGender() + "-" + a : null), i.push(t + "/face/" + e.appearance.getSkinColor()), i.push(t + "-hair-" + e.appearance.getGender() + "-" + e.appearance.getHairStyle() + "-" + e.appearance.getHairColor()), i.push(t + "/eyes/" + e.appearance.getGender() + "/" + e.appearance.getEyeColor()), i.push(Util.isDefined(e.equipment.getEquipment("hat")) ? t + "-hat-" + e.equipment.getEquipment("hat") : null), i.push("normal" === t && Util.isDefined(e.equipment.getEquipment("weapon")) ? t + "-weapon-" + e.equipment.getEquipment("weapon") : null), Util.isDefined(i[0]) || (i[0] = t + "-outfit-" + e.appearance.getGender() + "-13");
			var s = e.equipment.getEquipment("hat");
			if (Util.isDefined(s)) {
				var t = Items.getItemData("hat", s).type;
				("cover" === t || "wrap" === t) && (i[2] = null)
			}
			return i
		}
		
		PlayerContainer.prototype.setup = function() {
			if (Util.isDefined(this.assets)) {
				this.sprites.removeAll(!0);
				var e = this.assets[0],
					t = this.assets[1],
					a = this.assets[2],
					i = this.assets[3],
					s = this.assets[4],
					r = this.assets[5],
					o = this.game.assets.getImageBounds(e),
					n = Math.floor(-(64 * this.setScale - o[0])),
					h = -o[3];
				let isFemale = this.source.appearance.getGender() === "female";
				if (null !== t && (this.face = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? 93 : 44)), h - (o[1] - (1 != this.setScale ? 82 : 48)), "heads", t), this.sprites.add(this.face), this.faceY = this.face.y), null !== i && (this.eyes = new Sprite(this.game, n - (o[0] - (1 != this.setScale ? (isFemale ? 115 : 113) : 55)), h - (o[1] - (1 != this.setScale ? (isFemale ? 117 : 114) : (isFemale ? 66 : 65))), "heads", i), this.sprites.add(this.eyes), this.eyesY = this.eyes.y), null !== a) {
					var l = this.game.assets.getImageBounds(a);
					this.hair = new Sprite(this.game, n - (o[0] - l[0]), h - (o[1] - l[1]), a), this.sprites.add(this.hair), this.hairY = this.hair.y, this.hair.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hair.animations.add("stand", [0], 10, !0, !0), this.hair.animations.add("fct", [0], 10, !0, !0)
				}
				if (null !== s) {
					var p = this.game.assets.getImageBounds(s);
					this.hat = new Sprite(this.game, n - (o[0] - p[0]), h - (o[1] - p[1]), s), this.sprites.add(this.hat), this.hatY = this.hat.y;
					var d = Items.getItemData("hat", this.source.equipment.getEquipment("hat"));
					Util.isDefined(d) && 1 === d.standAnimation ? (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("fct", [0, 1, 2, 3], 10, !0, !0)) : (this.hat.animations.add("walk", [0, 1, 2, 3], 10, !0, !0), this.hat.animations.add("stand", [0], 10, !0, !0), this.hat.animations.add("fct", [0], 10, !0, !0))
				}
				if (this.body = new Sprite(this.game, n, h, e), this.sprites.add(this.body), this.animWalk = this.body.animations.add("walk", [0, 1, 2, 3, 4, 5, 6, 7], 10, !0, !0), this.animStand = this.body.animations.add("stand", [8, 9, 10, 11, 12, 13, 14, 15], 10, !0, !0), this.animFunction = this.body.animations.add("fct", [16, 17, 18, 19, 20, 21, 22, 23], 10, !0, !0), this.animFunction.onComplete.add(this.functionComplete.bind(this)), null !== r) {
					var u = this.game.assets.getImageBounds(r);
					this.weapon = new Sprite(this.game, n - (o[0] - u[0]), h - (o[1] - u[1]), r), this.sprites.add(this.weapon), this.weaponY = this.weapon.y
				}
				this.transforming && this.showSmoke(), this.sprites.callAll("play", null, "stand"), this.mode = 1, this.complete = !0, this.loading = !1
			}
		}
	}
}

window.checkForMods = function(e, t) {
	ModHooks = new ModHandler(e), ModHooks.log("Checking for mods...");
		for (i = 0, a = 0; a < ModHooks.available.length; a += 1)
			if (t.includes(ModHooks.available[a].id)) try {
				let e = ModHooks.available[a].patch;
				ModHooks[e].call(ModHooks), ModHooks.log('Mod "' + ModHooks.available[a].id + '" successfully applied!'), i++
			} catch (e) {
				ModHooks.error('Error occured while applying mod "' + ModHooks.available[a].id + '" to Prodigy!'), console.error(e)
			}
		i > 0 ? ModHooks.log("Applied (" + i + ") mods to the game") : ModHooks.log("No mods have been applied")
}
_.mixin({
	albumart : function (x, y, w, h) {
		this.paint = (gr) => {
			if (this.properties.cd.enabled) {
				if (this.properties.shadow.enabled) {
					_.drawImage(gr, this.images.shadow, this.x, this.y, this.w, this.h);
				}
				_.drawImage(gr, this.images.case_, this.x, this.y, this.w, this.h);
				if (this.img) {
					const ratio = Math.min(this.w / this.images.case_.Width, this.h / this.images.case_.Height);
					const nw = 488 * ratio;
					const nh = 476 * ratio;
					const nx = this.x + Math.floor((this.w - (452 * ratio)) / 2);
					const ny = this.y + Math.floor((this.h - nh) / 2);
					_.drawImage(gr, this.img, nx, ny, nw, nh, this.properties.aspect.value);
				}
				_.drawImage(gr, this.images.semi, this.x, this.y, this.w, this.h);
				if (this.properties.gloss.enabled) {
					_.drawImage(gr, this.images.gloss, this.x, this.y, this.w, this.h);
				}
			} else if (this.img) {
				_.drawImage(gr, this.img, this.x, this.y, this.w, this.h, this.properties.aspect.value);
			}
		}
		
		this.metadb_changed = () => {
			this.img = null;
			this.tooltip = this.path = '';
			if (panel.metadb) {
				this.img = utils.GetAlbumArtV2(panel.metadb, this.properties.id.value);
				if (this.img && panel.metadb.RawPath.indexOf('file') == 0) {
					utils.GetAlbumArtAsync(window.ID, panel.metadb, this.properties.id.value, true, false, true);
				}
			}
			window.Repaint();
		}
		
		this.get_album_art_done = (p) => {
			this.path = p;
			if (this.img) {
				this.tooltip = 'Original dimensions: ' + this.img.Width + 'x' + this.img.Height + 'px';
				if (_.isFile(this.path)) {
					this.tooltip += '\nPath: ' + this.path;
					if (panel.metadb.Path != this.path) {
						this.tooltip += '\nSize: ' + utils.FormatFileSize(fso.GetFile(this.path).Size);
					}
				}
			}
		}
		
		this.trace = (x, y) => {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		}
		
		this.wheel = (s) => {
			if (this.trace(this.mx, this.my)) {
				let id = this.properties.id.value - s;
				if (id < 0) {
					id = 4;
				}
				if (id > 4) {
					id = 0;
				}
				this.properties.id.value = id;
				_.tt('');
				panel.item_focus_change();
				return true;
			} else {
				return false;
			}
		}
		
		this.move = (x, y) => {
			this.mx = x;
			this.my = y;
			if (this.trace(x, y)) {
				if (this.img) {
					_.tt(this.tooltip);
				}
				this.hover = true;
				return true;
			} else {
				if (this.hover) {
					_.tt('');
				}
				this.hover = false;
				return false;
			}
		}
		
		this.lbtn_dblclk = (x, y) => {
			if (this.trace(x, y)) {
				if (panel.metadb && panel.metadb.Path == this.path) {
					_.explorer(this.path);
				} else if (_.isFile(this.path)) {
					_.run(this.path);
				}
				return true;
			} else {
				return false;
			}
		}
		
		this.rbtn_up = (x, y) => {
			panel.m.AppendMenuItem(MF_STRING, 1000, 'Refresh');
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(MF_STRING, 1001, 'CD Jewel Case');
			panel.m.CheckMenuItem(1001, this.properties.cd.enabled);
			panel.m.AppendMenuItem(this.properties.cd.enabled ? MF_STRING : MF_GRAYED, 1002, 'Gloss effect');
			panel.m.CheckMenuItem(1002, this.properties.gloss.enabled);
			panel.m.AppendMenuItem(this.properties.cd.enabled ? MF_STRING : MF_GRAYED, 1003, 'Shadow effect');
			panel.m.CheckMenuItem(1003, this.properties.shadow.enabled);
			panel.m.AppendMenuSeparator();
			_.forEach(this.ids, (item, i) => {
				panel.m.AppendMenuItem(MF_STRING, i + 1010, item);
			});
			panel.m.CheckMenuRadioItem(1010, 1014, this.properties.id.value + 1010);
			panel.m.AppendMenuSeparator();
			_.forEach(this.aspects, (item, i) => {
				panel.m.AppendMenuItem(MF_STRING, i + 1020, item);
			});
			panel.m.CheckMenuRadioItem(1020, 1023, this.properties.aspect.value + 1020);
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(_.isFile(this.path) ? MF_STRING : MF_GRAYED, 1030, 'Open containing folder');
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(panel.metadb ? MF_STRING : MF_GRAYED, 1040, 'Google image search');
			panel.m.AppendMenuSeparator();
		}
		
		this.rbtn_up_done = (idx) => {
			switch (idx) {
			case 1000:
				panel.item_focus_change();
				break;
			case 1001:
				this.properties.cd.toggle();
				window.Repaint();
				break;
			case 1002:
				this.properties.gloss.toggle();
				window.RepaintRect(this.x, this.y, this.w, this.h);
				break;
			case 1003:
				this.properties.shadow.toggle();
				window.RepaintRect(this.x, this.y, this.w, this.h);
				break;
			case 1010:
			case 1011:
			case 1012:
			case 1013:
			case 1014:
				this.properties.id.value = idx - 1010;
				panel.item_focus_change();
				break;
			case 1020:
			case 1021:
			case 1022:
			case 1023:
				this.properties.aspect.value = idx - 1020;
				window.RepaintRect(this.x, this.y, this.w, this.h);
				break;
			case 1030:
				_.explorer(this.path);
				break;
			case 1040:
				_.run('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(panel.tf('%album artist%[ %album%]')));
				break;
			}
		}
		
		this.key_down = (k) => {
			switch (k) {
			case VK_LEFT:
			case VK_UP:
				this.wheel(1);
				return true;
			case VK_RIGHT:
			case VK_DOWN:
				this.wheel(-1);
				return true;
			default:
				return false;
			}
		}
		
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.mx = 0;
		this.my = 0;
		this.tooltip = '';
		this.img = null;
		this.path = null;
		this.hover = false;
		this.aspects = ['Crop (focus on centre)', 'Crop (focus on top)', 'Stretch', 'Centre'];
		this.ids = ['Front', 'Back', 'Disc', 'Icon', 'Artist'];
		this.images = {
			shadow : _.img('cd\\shadow.png'),
			case_ : _.img('cd\\case.png'),
			semi : _.img('cd\\semi.png'),
			gloss : _.img('cd\\gloss.png')
		};
		this.properties = {
			aspect : new _.p('2K3.ARTREADER.ASPECT', image.crop),
			gloss : new _.p('2K3.ARTREADER.GLOSS', false),
			cd : new _.p('2K3.ARTREADER.CD', false),
			id : new _.p('2K3.ARTREADER.ID', 0),
			shadow : new _.p('2K3.ARTREADER.SHADOW', false)
		};
	}
});

/* =====================================================================
 * tidy-select.js v0.0.1
 * http://github.com/djreimer/tidy-select
 * =====================================================================
 * Copyright (c) 2014 Derrick Reimer
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ===================================================================== */

;(function($, window, document, undefined) {

  var Option = function(options) {
    this.options = options || {};
    this.$el = options.$el;
    this.control = options.control;
  }

  Option.prototype = {
    constructor: Option

  , select: function() {
      var $select = this.$el.parent();
      $select.val(this.$el.val());
      $select.trigger("change");
    }

  , value: function() {
      return this.$el.val();
    }

  , title: function() {
      return this.$el.html();
    }

  , description: function() {
      return this.$el.data("description");
    }

  , render: function() {
      var self = this;
      self.$option = $("<li data-value='" + this.value() + "'></li>");
      self.$option.append("<span class='ts-title'>" + this.title() + "</span>");

      if (this.description()) {
        self.$option.append("<span class='ts-description'>" + this.description() + "</span>");
      }

      self.$option.on("click", function(e) {
        e.preventDefault();
        self.select();
      });

      return self.$option;
    }
  }

  var Control = function(el, options) {
    var self = this;

    self.$el = $(el);
    self.$control = $("<div class='ts-control'></div>");

    self.options = options || {};
    self.defaultText = self.options.defaultText || "Choose an item...";
    self.width = self.options.width || self.$el.data("width") || "auto";

    self.render();

    $("html").on("click", function() {
      self.$control.removeClass("open");
    });

    $("body").on("click", ".ts-control .ts-popover", function(e) {
      e.stopPropagation();
    });

    self.$el.on("change", function() {
      self.update();
    });

    self.$control.on("click", function(e) {
      e.preventDefault();
      self.toggle();
      return false;
    });

    self.update();
  }

  Control.prototype = {
    constructor: Control

  , close: function() {
      this.$control.removeClass("open");
    }

  , open: function() {
      $(".ts-control").removeClass("open");
      this.$control.addClass("open");
    }

  , toggle: function() {
      this.$control.hasClass("open") ? this.close() : this.open();
    }

  , update: function() {
      var $option = this.$el.find("option:selected");
      var text = $option.text();
      var value = $option.val();
      if (!text || text == "") text = this.defaultText;

      this.$dropdown.html(text);
      this.$options.find("li").removeClass("selected");
      this.$options.find("li[data-value='" + value + "']").addClass("selected");
    }

  , reset: function(options) {
      options || (options = []);
      var selected = this.$el.val();
      this.$el.html(""); // remove existing options
      this.$el.append("<option value='' selected='selected'>" + this.defaultText + "</option>");

      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        $optionEl = $("<option></option>");

        if (option.value) {
          $optionEl.val(option.value);
        }
        
        if (option.title) {
          $optionEl.html(option.title);
        }

        if (option.description) {
          $optionEl.data("description", option.description);
        }

        this.$el.append($optionEl);
      }

      this.render();
      this.$el.val(selected);
    }

  , clear: function() {
      this.$el.find("option:selected").attr("selected", false);
      this.update();
    }

  , render: function() {
      var self = this;
      self.$control.html("");

      // Inherit class list from the original "select"
      self.$control.attr("class", "ts-control " + self.$el.attr("class"));

      self.$dropdown = $("<a href='#' class='ts-dropdown'></a>");
      self.$popover = $("<div class='ts-popover'></div>");
      self.$options = $("<ul class='ts-options'></ul>");

      self.$el.find("option").each(function() {
        var $option = $(this);

        if ($option.val() !== "") {
          var option = new Option({
            $el: $option,
            control: self
          });

          self.$options.append(option.render());
        }
      });

      self.$popover.append(self.$options);
      self.$control.append(self.$dropdown);
      self.$control.append(self.$popover);

      self.$el.after(self.$control);

      if (self.width == "inherit") {
        self.$control.css("width", self.$el.width());
      } else if (self.width != "auto") {
        self.$control.css("width", self.width);
      }

      self.$el.css("display", "none");
      self.update();
    }
  }
  
  $.fn.tidySelect = function(options) {
    var args = Array.prototype.slice.call(arguments);

    return this.each(function() {
      var $this = $(this)
        , data = $this.data('tidySelect');
      if (!data) $this.data('tidySelect', (data = new Control(this, options)));
      if (typeof options == 'string') {
        return data[options].apply(data, args.slice(1));
      }
    });
  }
}(jQuery, window, document));
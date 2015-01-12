var api = {
  key: "trnsl.1.1.20150106T213915Z.20ac8f94bdd2fac3.20f6d79974248576a2736e13a49012c666af5b1e",
  dirs: "https://translate.yandex.net/api/v1.5/tr.json/getLangs",
  translate: "https://translate.yandex.net/api/v1.5/tr.json/translate",
};

var dirs;
var langs;

function translate(text, lang_from, lang_to, callback) {
  console.log(text + " " + lang_from + " " + lang_to);
  if (lang_from == lang_to) {
    callback(text);
    return;
  }
  if (-1 != $.inArray(lang_from + "-" + lang_to, dirs)) {
    $.get(
      api.translate,
      {
        key: api.key,
        lang: lang_from + "-" + lang_to,
        text: text
      },
      function(data) {
        callback(data.text[0]);
      }
    );
  } else {
    $.each(["ru"], function(idx, val) {
      var mid = val;
      translate(text, lang_from, mid, function(data) {
        translate(data, mid, lang_to, callback);
      });
    });
  }
}

function randomText(callback) {

}

// add lang div to selected_langs block
function addSelected(lang_id, lang_name) {
  if (!lang_name) {
    lang_name = langNames[lang_id];
  }
  $("<div/>", { "class": "lang", html: lang_name })
    .appendTo($("#selected_langs"))
    .data("lang", lang_id)
    .click(function(event) {
      $(this).remove();
    });
}

function randomLang() {
  if (0 == langs.length) {
    return "";
  }
  return langs[rand() % langs.length];
}

// read all languages from %langs% and add appropriate of them
// to ::langs and to avail_langs block
function addLangs(langs) {
  var dirsSet = {};
  $.each(dirs, function(idx, val) {
    dirsSet[val] = true;
  });

  for (lang in langs) {
    var good = false;
    $.each(["ru"], function(idx, val) { // extendable to several mid values
      var mid = val;  
      if (mid == lang || (dirsSet[lang + "-" + mid] && dirsSet[mid + "-" + lang])) {
        good = true;
        return false; // break in $.each()
      }
    });
    if (!good) {
      continue;
    }
    window.langs.push(lang);
    $("<div/>", { "class": "lang", id: lang, html: langs[lang]})
      .appendTo($("#avail_langs"))
      .click(function(event) {
        lang = $(event.target).attr("id");
        html = $(event.target).html();
        addSelected(lang, html);
      });
  }
}

// list of currently selected languages
function selectedList() {
  res = []
  $("#selected_langs .lang").each(function() {
    res.push($(this).data("lang"));
  });
  return res;
}

function loadDirs() {
  $.get(
    api.dirs,
    { key: api.key, ui: "ru" },
    function(data) {
      dirs = data.dirs;
      addLangs(data.langs);
    }
  );
}

// translate text from text_in using language list
// and asyncronously put the result in text_out
function translateAll(text) {
  lang_list = selectedList();
  if (lang_list.length < 2) {
    $("#text_out").val("Выберите хотя бы два языка");
    return;
  }

  $("#text_out").val("Пожалуйста, подождите...");

  function translate_pair(text, idx) {
    console.log("idx = " + idx);
    if (idx == lang_list.length) {
      $("#text_out").val(text);
    } else {
      translate(text, lang_list[idx - 1], lang_list[idx], function(data) {
        translate_pair(data, idx + 1);
      });
    }
  }

  translate_pair(text, 1);
}

$(document).ready(function() {
  loadDirs();
  $("#translate").click(function(event) {
    translateAll($("#text_in").val());
  });
  $("#random_text").click(function(event) {
    randomText
    translateAll($("#text_in").val());
  });

  addSelected("ru", "Русский");
  addSelected("es", "Испанский");
  addSelected("de", "Немецкий");
  addSelected("tr", "Турецкий");
  addSelected("fr", "Французский");
  addSelected("en", "Английский");
  addSelected("es", "Испанский");
  addSelected("de", "Немецкий");
  addSelected("ru", "Русский");

  $("#text_in").val("Война Севера и Юга началась во дворе дома простого бакалейщика (на илл.), а закончилась в его же гостиной.");
});

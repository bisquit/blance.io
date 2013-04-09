jQuery(function($){
    
   /* IE用 */
   if(isIE){
     $(".info", $(".a_form")).css("lineHeight", "38px");
   }
  
  
  
   /* はかりのセットアップ */
  
  var balance_y = $("#balance").position().top; //中央の秤のy座標(.scaleからの相対値)=200
  
  // 両天秤の皿とそれに連動する秤のボトムを中央の秤のトップに合わせる
  var incomes = $(".income_parts"), //income側の皿と黄色の秤画像
      outgos = $(".outgo_parts"); //outgo側の皿とオレンジの秤画像
  
  var income_plate = incomes.first(),
      income_plate_height = income_plate.height(),
      outgo_plate = outgos.first(),
      outgo_plate_height = outgo_plate.height();
  
  // 秤の位置を初期化する関数 すぐ実行
  var initBalance = function(){
      
    　　// incomeの皿のボトムを中央の秤のトップに合わせる　10pxずらすのはボーダーの太さと見栄えを考慮して
      income_plate.css({ top: balance_y - income_plate_height + 10 });
      
    　　// incomeの秤も秤の高さ分(178px)上にずらす
      var income_balance = incomes.last();
      income_balance.css({ top: -178 });
    
    　　// 同様にoutgoも
      outgo_plate.css({ top: balance_y - outgo_plate_height + 10 });
      
      var outgo_balance = outgos.last();
      outgo_balance.css({ top: -178 });
    
  };
  
  initBalance();
    
  // incomeおよびoutgoの合計値を保持する変数
  var sum_incomes = 0,
      sum_outgos = 0;
  
  // 背景色のdiv
  var back_balance = $("#back_balance");
  
  // income, outgo, 中央の秤の集合 アイテムが一杯になったとき下に動かす
  var scales = $(".scale");
  
  // アイテムの詳細を書くテキストエリア
  var item_detail = $("#item_detail")
  
  // 諸定数(変数)たち
  var LIMIT = 20000, //　←秤に乗せられる上限と、↓それをセット
      limit_scale = $("#limit_scale").text(LIMIT);
  
  /* サポートメッセージに関するメソッド 
     利用する時はサポートメッセージの前の要素をthisとして渡す */
  var SupportMethod = {
    showSupportMsg : function(){
      var $msg = $(this).next().fadeIn(800);
      setTimeout(function(){
        $msg.fadeOut(800); // 12秒経った場合でも消える
      }, 12000);
    },
    hideSupportMsg : function(){
        $(this).next().fadeOut(500);
    }
  };
  
  
  /* アイテムが秤に乗った時のアニメーション
  　　パラメータ：どちらの秤か(scale)　金額(sum) アイテムが一杯になり下にずらす必要があるか(doShift)　*/
  var springScale = function(scale, sum, doShift){
      
    /* ばねの動きがややこしくならないようにボタンイベントを外しておく */
    btn.off("click");
    
    /* 目的のy地点　デフォルトで上限を20000, 秤の高さを178としています
       また後述のイージングの計算のために、アニメーション前の秤のトップ座標を足しています*/
      var target_y = sum/LIMIT * 178 + (+scale.css("top").split("px")[0]); 
      target_y = target_y >> 0;
      if(target_y > 256){ // 上限を超えたら
        target_y = 255;
        $.proxy(swapLimitForm, limit_scale.parent())();
        $.proxy(SupportMethod.showSupportMsg, document.getElementById("limit_scale"))();
      }
    
      var vy = 0, // y速度
          intervalCount = 0; // 約1.6秒後に止めるためのカウント
    
      var cid = setInterval(function(){
        vy += (target_y - scale.css("top").split("px")[0]) * 0.2;
        vy += 0.2;
        vy *= 0.85;
        scale.css({ top: "+="+vy+"px"});
        
        intervalCount += 1;
        if(intervalCount >= 80){
          clearInterval(cid);
          if(doShift) scales.animate({
                "marginTop": "+=100px"
          }, 200); // 秤全体を下にずらす
          btn.on("click", dropItem);
        }
      },16);
    
      /* 合計値を更新 */
    if(scale === incomes){
      sum_incomes += sum;
      $("#sum_income").text(sum_incomes);
    }else{
      sum_outgos += sum;
      $("#sum_outgo").text(sum_outgos);
    }
      /* 背景を過多な方の色にする */
    var status;
    (sum_incomes > sum_outgos)? status = "plus":
    (sum_incomes < sum_outgos)? status = "minus":
                                status = "equal";
    
    back_balance.removeClass();
    back_balance.addClass("backcolor");
    back_balance.addClass(status);
    
  };
  
  /* 新しいアイテムをセットし、フリーフォールさせる関数 */
  var dropItem = function(){
      
      /* アイテムのパラメータとか */
      var item_title = $("#item_title").val(),
          item_sum = $("#item_sum").val(),
          item_detail = $("#item_detail").val();
          
      if(!item_title){
          $("#item_title").focus();
          return;
      }else if(item_sum === "" || !+item_sum){
          $("#item_sum").focus();
          return;
      }
    
      /* income or outgo? */
      var which_scale = this.id.slice(4),
          $scale = $("#scale_" + which_scale),
          $scale_lists = $("ul", $scale); // <- incomeかoutgoの<ul>
    
      /* アイテムを落とすy位置 */
      var lists_y = $scale_lists.offset().top, // ページ上の<ul>y座標
          drop_pos = -lists_y + 100; // 落下開始地点をページ上端から100に設定
      
      /* アイテムを<li>として追加 */
      var $item_added = $("<li>", {
          //text: item_title + "￥" + item_sum,
          css: { position: "absolute",
                 top: drop_pos,                 
                 zIndex: 100 },
          class: "clickable",
      }).appendTo($scale_lists);
      
      $item_added.html("￥" + "<span class='italic_text'>" + item_sum + "</span>" + " / " + item_title);
    
      /* アイテムのデータに日付と詳細を追加 */
      var dateObj = new Date();
      $item_added.data("date", { month:dateObj.getMonth(), day:dateObj.getDate()});
      $item_added.data("detail", item_detail);
     
     /* 追加されたアイテムを落下させる = grv() */ 
     /* 着地したら秤をアニメーションさせる = springScale() */ 
     var list_amount = $scale_lists.children().length, // クリックされた方の<li>の数
         stop_pos = (list_amount - 1) * (-25) + 10, // アイテムの着地点 
         do_shift = false; // 秤を下にずらす必要があるか    
           
     var grv =  gravitate($item_added, drop_pos);
     var cid = setInterval(function(){ 
         grv(); 
         if(checkCollision($item_added, stop_pos)){ //着地判定
           clearInterval(cid);
           
            //ページ上部から120pxの余白がとれなかったら秤をシフトする
           if($item_added.offset().top < 120) do_shift = true;
           (which_scale === "income")? springScale(incomes, +item_sum, do_shift):
                                       springScale(outgos, +item_sum, do_shift);
         }
      }, 10);
    
      /* フォームの値をリセットし、最初のフォームにフォーカスを戻す */
      $("#item_title").val("").focus(),
      $("#item_sum").val(""),
      $("#item_detail").val("");
      
   };
  
  /* イベントをセット */
  var btn = $(".btn").on("click", dropItem);
  
  
  /* 各フォームにフォーカスがあたった時の処理(1回だけ) */
  $(".info").one("focus", function(){
      $.proxy(SupportMethod.showSupportMsg, this)();           
  }).one("blur", function(){
      $.proxy(SupportMethod.hideSupportMsg, this)();
  });
  
        
  /* テキストエリアには別にfocusイベントをセット */
  $("#item_detail").on("focus", function(){
      $(this).addClass("active");
  }).on("blur", function(){
      $(this).removeClass("active");
  });
  
  /* 上限フォームクリック時にイベントを発火させる */
  // まずクリック時にinput[number]とすり替える関数
  var swapLimitForm = function(){
      this.off("click"); // イベント外しておく
    
      var limit = limit_scale.text(); //値を保持しておく
      var newDom = newDom || $("<input>", {
        class:"italic_text", type:"number", step:"1000"
      });
      limit_scale.hide();
      this.append(newDom.val(limit));
      
      newDom.focus().on("blur", function(){
        var value = newDom.val();
        if(!+value)
          value = limit; // 無効な数値だったら以前のまま        
        newDom.hide();
        limit_scale.show().text(value);
        limit_scale.parent().on("click", $.proxy(swapLimitForm, limit_scale.parent()));
        
        LIMIT = value; // 上限値を更新
        var temp_sum_incomes = sum_incomes,
            temp_sum_outgos = sum_outgos;
        sum_incomes = 0;
        sum_outgos = 0;
        initBalance(); // 上記操作で秤は初期化される
        springScale(incomes, temp_sum_incomes, false); // で、また累積金額を乗せる
        springScale(outgos, temp_sum_outgos, false); // で、また累積金額を乗せる
      });
  };
  // イベントセット
  limit_scale.parent().on("click", $.proxy(swapLimitForm, limit_scale.parent()));
    
  /* 各アイテムのホバー時、アウト時に詳細を表示切り替え */  
    // mouseoverコールバック thisにliとなる要素を渡す
  var onItemHover = function(){
      console.log(this);
      var $li = $(this),
          date = $li.data("date"),
          detail = $li.data("detail");
    
      var which_scale = $li.parent().attr("id"); // "income_lists" or "outgo_lists"
            
      var info = date.month + "/" + date.day + "  ";
      info += $li.text() + "\n";
      info += detail;
      item_detail.val(info).addClass("active");
      /* 背景色を変える */
      (which_scale === "income_lists")? item_detail.css("background", "#f4d837"):
                                        item_detail.css("background", "#f2a638");
  };
    // mouseoutコールバック
  var onItemOut = function(){  
      item_detail.val("").css("background", "#ffffff").removeClass("active");
  };
  
  $("ul", ".abs_area").on("mouseover", "li", function(){
      $.proxy(onItemHover, this)();
  })
  /* 逆にマウスリーブした時に詳細表示を消す */
  .on("mouseout", "li", onItemOut)
  /* クリックで詳細を編集 */
  .on("click", "li", function(){
      var $self = $(this);
      var $parent = $self.parent().off("mouseout mouseover");
      item_detail.val("").attr("placeholder","追記事項を記入してください").focus();
      item_detail.one("blur", function(){
        var detail;
        if(( detail = item_detail.val() ) != ""){
            var oldData = $self.data("detail");
            $self.data("detail", oldData + "\n(追記) " + detail);
        }
        $parent.on("mouseover", "li", function(){
            $.proxy(onItemHover, this)();
        }).on("mouseout", onItemOut);
        
        item_detail.val("").attr("placeholder","");
      });
  });
  
  
  /* Enterキーでもボタンを押せるようにする */
  $("html").on("keypress", function(e){
      // enterキーなら
      if(e.keyCode === 13){
          if(e.shiftKey){
            $("#btn_outgo").click();
          }else{
            $("#btn_income").click();
          }
      }
  });
  
  
  /* Util関数 */
  function gravitate($item, init_y){
    
    var gravity = 0.1,
        y = init_y,
        vy = 0;
    
      return function(){
        $item.css({ top: y });
        vy += gravity;
        y += vy;
      };
  }

  function checkCollision($item, stopPos){
       
      var item_bottom = $item.position().top + $item.height();
      if(item_bottom >= stopPos) // ここは最上のアイテムのトップに置き換える
        return true;
      else
        return false;
  }
  /* Util関数　ここまで */
  
  
  /* 準備完了。最初のフォームにフォーカスしますか*/
  $("#item_title").focus();
    
});



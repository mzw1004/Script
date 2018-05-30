


////////////////////////////////////////////////////////////////////////
//
// UI global variables
//
////////////////////////////////////////////////////////////////////////
KEY_LEFT = 37;
KEY_UP = 38;
KEY_RIGHT = 39;
KEY_DOWN = 40;
KEY_DEL = 46;
KEY_BACKSPACE = 8;
KEY_TAB = 9;
changed = true;
changedByJavascript = false;

pos = new Array(81); // Last position entered/selected by the user



rowname = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];
colname = ["a", "d", "g", "b", "e", "h", "c", "f", "i"];
colmap  = [0, 3, 6, 1, 4, 7, 2, 5, 8];
blockname = [
//	["upper left", "upper middle", "upper right"],
//	["middle left", "center", "middle right"],
//	["lower left", "lower middle", "lower right"]
	["左上ブロック", "ミドル上ブロック", "右上ブロック"],
	["左真ん中ブロック", "中心ブロック", "右真ん中ブロック"],
	["左下ブロック", "ミドル下ブロック", "右下ブロック"]
];

highlight_grey = '#d8d8d8';
highlight_red = '#ff8080';
highlights = false;
doitforme = 0;

list = ""; // Used to build strings of the form "a, b, c"

trace = true;

regenhxs = false;


////////////////////////////////////////////////////////////////////////
//
// GetPos()
//
////////////////////////////////////////////////////////////////////////
function GetPos ()
{
	var i;
	var n;

	// Initialize globals
	for (i = 0 ; i < 81 ; i++)
		xpos[i] = 0x1ff;
	for (i = 0 ; i < 9 ; i++)
	{
		buckets[i] = 0x1ff;
	}
	numSquares = 0;

	// Import the current position
	for (i = 0 ; i < 81 ; i++)
	{
		value = document.sudoku["s" + i].value;
		if (value.length==1)
		{
			n = value.charCodeAt(0) - 49;
			if (n >= 0 && n <= 8)
				SetSquare(n, i);
		}
	}

	changed = false;
}

////////////////////////////////////////////////////////////////////////
//
// WriteBoard()
//
// printing: 0 - not printing
//           1 - printing board only
//           2 - printing state
//
////////////////////////////////////////////////////////////////////////
function WriteBoard (doc, printing)
{
	var i, j, k, l, m, value;

	doc.writeln("<table cellspacing=0 cellpadding=0 border=0><tr>");
	doc.writeln("<td class=board><table cellspacing=0 cellpadding=0 border=0>");
	for (i = 0 ; i < 3 ; i++)
	{
		doc.writeln("<tr>");
		for (j = 0 ; j < 3 ; j++)
		{
			doc.writeln("<td class=block><table cellspacing=0 cellpadding=0 border=0>");
			for (k = 0 ; k < 3 ; k++)
			{
				doc.writeln("<tr>");
				for (l = 0 ; l < 3 ; l++)
				{
					var index = (27*i + 9*k + 3*l + j);
					if (printing)
					{
						value = document.sudoku["s" + index].value;
						if (value == "")
						{
								doc.writeln("<td class=square>&nbsp;");
						}
						else
							doc.writeln("<td class=square>" + value);
					}
					else
					{
						doc.writeln("<td class=square id=t" + index + ">");
						doc.write("<textarea class=square readonly='readonly'  type=text name=s" + index + " ></textarea>");
					}
					doc.writeln("</td>");
				}
				doc.writeln("</tr>");
			}
			doc.writeln("</table></td>");
		}
		doc.writeln("</tr>");
	}
	doc.writeln("</table></td>");

	doc.writeln("</tr></table></td></tr></table>");

	// Set the focus to the first square

}



////////////////////////////////////////////////////////////////////////
//
// LoadPuzzle2()
//
////////////////////////////////////////////////////////////////////////

function LoadPuzzle2(k)
{
	if (k !="")
	{
  		var i;
  		for (i = 0 ; i < 81 ; i++)
  		{
  			var row = Math.floor(i/9);
  			var col = i%9;
  			var index = 9*row + 3*(col%3) + Math.floor(col/3);
  			pos[index] = k.charAt(i);
  			if ((pos[index] == " ") || (pos[index] == "0") || (pos[index] == "."))
  				pos[index] = "";
  			document.sudoku["s" + index].value = pos[index];
  			document.sudoku["s" + index].className = 'square';
  		}

  		GetPos();
  		SethxsAll();
	}
}

function LoadAnswer(tmda)
{
	var k=tmda.substr(81,81)
	var tm=tmda.substr(0,81)
	if (k !="")
	{
  		var i;
  		for (i = 0 ; i < 81 ; i++)
  		{
  			var row = Math.floor(i/9);
  			var col = i%9;
  			var index = 9*row + 3*(col%3) + Math.floor(col/3);
  			pos[index] = k.charAt(i);
  			if ((pos[index] == " ") || (pos[index] == "0") || (pos[index] == "."))
  				pos[index] = "";
  			document.sudoku["s" + index].value = pos[index];
  			if (tm.charAt(i)=='0')
  					document.sudoku["s" + index].className = 'square2'
  			else document.sudoku["s" + index].className = 'square';
  		}
	}
}

////////////////////////////////////////////////////////////////////////
//
// GiveHint()
//
////////////////////////////////////////////////////////////////////////
function GiveHint (hint)
{
	document.getElementById("hint").innerHTML = "<b>" + hint + "</b>";
	if (doitforme)
		document.sudoku["doitforme"].focus();

	doitforme = false;
	stuck = false;

}

////////////////////////////////////////////////////////////////////////
//
// DoItForMe()
//
////////////////////////////////////////////////////////////////////////
function DoItForMe (n, index)
{
	doitforme = 1;
	return "<br><br><input type=button name=doitforme onclick='DoHintMove(" + n + "," + index + ")' value=\"Do it for me"+"\">";

}



//=======================================================================================================
//
//  SUDOKU ENGINE
//
//=======================================================================================================


////////////////////////////////////////////////////////////////////////
//
// Global variables
//
////////////////////////////////////////////////////////////////////////

xpos = new Array(81);       // Bitmask of possible digits in location k
influence = new Array(81);  // influence[k] = list of 20 squares in the same row/column/block as k
markPresent = new Array(9); // used to mark squares for graph algorithms
markAbsent = new Array(9);  // used to mark squares for graph algorithms
markCounter = 0;            // Square k is marked when mark[k] == markCounter
longerChainExists = false;
debugInfluence = 0;

commonInfluence = new Array(20); // Used to compute common influence of two squares
commonSize = 0;

// The xpos array encodes the sudoko board in the following order:
//
// 0  3  6  1  4  7  2  5  8
//
// 9 12 15 10 13 16 11 14 17
//
// ...
//
// Use the notation {a,b} for the arithmetic sequence
// {a, a+b, ..., a+8b}.  Then row k is {0,k}, column k
// is {k,9}, and block (i,j) is {27j+i,3}.
//

buckets = new Array(9); // buckets[3*j + i] = Bitmask of possible bucket optimizations in block (i,j)

stuck = false;
numSquares = 0;
weight = new Array(512); // number of 1's in binary representations of 0-511
hintOnly = false;

// Globals used for chain searches
firstIndex = 0;
searchDigit = 0;
searchType = 0;

// Inference rule caches
influenceCache = new Array(9 * 81 * 20);
lockedPairCache = new Array(9 * 81 * 3);

////////////////////////////////////////////////////////////////////////
//
// Initialization
//
////////////////////////////////////////////////////////////////////////
function Initialize ()
{
	var i, j, k;

	// Initialize weight table
	for (i = 0 ; i < 512 ; i++)
	{
		weight[i] = 0;
		for (j = 256 ; j ; j >>= 1)
		{
			if (i & j)
				weight[i]++;
		}
	}

	// Initialize the influence table
	for (k = 0 ; k < 81 ; k++)
	{
		influence[k] = new Array(20);
		var row = Math.floor(k/9);
		var col = k%9;
		var blockx = col%3;
		var blocky = Math.floor(row/3);
		j = 0;

		// Add block
		var base = blocky * 27 + blockx;
		for (i = 0 ; i < 9 ; i++)
		{
			if (base + 3*i != k)
				influence[k][j++] = base + 3*i;
		}

		// Add row
		base = row * 9;
		for (i = 0 ; i < 9 ; i++)
		{
			if ((i%3) != blockx)
				influence[k][j++] = base + i;
		}

		// Add column
		base = col;
		for (i = 0 ; i < 9 ; i++)
		{
			if (Math.floor(i/3) != blocky)
				influence[k][j++] = base + 9*i;
		}

		influence[k].sort(function(a,b) { return a-b; });
	}

	// Initialize the marks
	for (i = 0 ; i < 9 ; i++)
	{
		markPresent[i] = new Array(81);
		markAbsent[i] = new Array(81);
		for (k = 0 ; k < 81 ; k++)
		{
			markPresent[i][k] = 0;
			markAbsent[i][k] = 0;
		}
	}
}

Initialize();



////////////////////////////////////////////////////////////////////////
//
// SetSquare()
//
// Set square[index] with digit (n+1)
//
////////////////////////////////////////////////////////////////////////
function SetSquare (n, index)
{
	var bit = 1 << n;
	var irow = 9 * Math.floor(index / 9);
	var icol = index % 9;
	var iblock = 27 * Math.floor(index / 27) + (index % 3);
	var k;

	document.sudoku["s" + index].value = (n+1);
	xpos[index] = 0;
	changedByJavascript = true;

	for (k = 0 ; k < 9 ; k++)
	{
		xpos[irow + k] &= ~bit;
		xpos[icol + 9*k] &= ~bit;
		xpos[iblock + 3*k] &= ~bit;
	}
	buckets[(icol%3) + 3 * Math.floor(irow/3)] &= ~bit;

	numSquares++;
}





////////////////////////////////////////////////////////////////////////
//
// Index()
//
////////////////////////////////////////////////////////////////////////
function Index (bit)
{
	var index = 0;
	for ( ; !(bit & 1) ; bit >>= 1, index++);
	return index;
}









////////////////////////////////////////////////////////////////////////
//
// Reset()
//
////////////////////////////////////////////////////////////////////////
function Reset ()
{
	if (confirm("数独をイニシャル状態にリセットしますか？"))
	{
		ResetHints();
		var i;
		for (i = 0 ; i < 81 ; i++)
			document.sudoku["s" + i].value = pos[i];
		changed = true;
		changedByJavascript = true;
		GetPos();
		SethxsAll();
		document.sudoku["hintButton"].focus();

	}
}

////////////////////////////////////////////////////////////////////////
//
// Erase()
//
////////////////////////////////////////////////////////////////////////
function Erase ()
{
	if (confirm("数独をクリアしますか？"))
	{
		ResetHints();
		var i;
		for (i = 0 ; i < 81 ; i++)
		{
			pos[i] = document.sudoku["s" + i].value = "";
			document.sudoku["s" + i].className='square';
		}
		changed = true;
		changedByJavascript = true;
		document.sudoku["s0"].select();
		GetPos();
	}
}



////////////////////////////////////////////////////////////////////////
//
// Fetch()
//
////////////////////////////////////////////////////////////////////////
function FetchPosition ()
{
	var win = window.open('',"loading",'height=75,width=170');
	var doc = win.document;

//	doc.writeln("<html><frameset rows=\"74,1\">");
//	doc.writeln("<frame src=\"loading.html\">");
//	doc.writeln("<frame src=\"http://magictour.free.fr/top95\">");
//	doc.writeln("</frameset></html>");

	doc.writeln("<html><body>");
	doc.writeln("<iframe src=\"http://magictour.free.fr/top95\"></iframe>");
	doc.writeln("</body></html>");

	doc.close();

	alert(win.document.all[0].all[1].all[0].innerHTML);

	//win.close();
}

function importsudoku()
{
	var dstring;
	var actualstr='';
	var c,i,j,s,t;
	var dstring=window.prompt("数字のストリングを81個入力（ブランクは0、*、.で表示)",'');
	if( dstring === null ) return;
	if( dstring.length === 0 ) return;

	dstring=dstring.replace(/\*/g, '0').replace(/\./g, '0').replace(/_/g, '0')

	LoadPuzzle2(dstring);

}




function Gethxs(x)
{
  	var s='';
  	var i;
  	for (i = 0 ; i <= 8 ; i++)
  	 {if (x & (1 << i))
  	{s=(s+(i+1));}
  	 }
  	return s;
  	}

function Gethxs2(x)
{
  	var s='';
  	var i;
  	for (i = 0 ; i <= 8 ; i++)
  	 {if (x & (1 << i))
  	     {
  	     	s=(s+(i+1));
  	     	if ((i%3)==2) {s=s+'\n'} else s=s+' ';
  	     	}
  	   else
  	   {if ((i%3)==2) {s=s+' \n'} else s=s+'  ';}
  	 }
  	return s;
  	}


function SethxsAll()
{
	var j;

	if (document.getElementById("showhints").checked)
	{

       for (j = 0 ; j <= 80 ; j++)
       {
       	if (Gethxs(xpos[j]) != '')
       	{
       	    document.sudoku["s" + j].value = Gethxs2(xpos[j]) ;
       	    document.sudoku["s" + j].className='square3';
         }
       }
  }
	else {

       for (j = 0 ; j <= 80 ; j++)
       {
       	if (Gethxs(xpos[j]) != '')
       	{
       	    document.sudoku["s" + j].value = '';
       	    document.sudoku["s" + j].className='square';
         }
       }
  }

}


function showhxs()
{
  SethxsAll();
}

function rqstr(n,nd)
{
var uom = new Date(new Date()-0+n*86400000);
uom = '?nd='+nd+'&y='+uom.getFullYear() + "&m=" + (uom.getMonth()+1) + "&d=" + uom.getDate();
return uom;
}

function randomrqstr(nd)
{
var vNum;
vNum = Math.random();
vNum = Math.round(vNum*100)*-1;
var uom = rqstr(vNum,nd);
return uom;
}

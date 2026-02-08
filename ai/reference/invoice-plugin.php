<?php
/**
 * Plugin Name: NorthStar Invoice Generator
 * Description: Simple invoice generator. Use shortcode [northstar_invoice] on any page.
 * Version: 3.0
 * Author: NorthStar Roofing
 */
if (!defined('ABSPATH')) exit;

register_activation_hook(__FILE__, 'ns_inv_activate');
function ns_inv_activate() {
    global $wpdb;
    $t = $wpdb->prefix . 'ns_invoices';
    $c = $wpdb->get_charset_collate();
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta("CREATE TABLE $t (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        invoice_num VARCHAR(100) NOT NULL,
        invoice_data LONGTEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY invoice_num (invoice_num)
    ) $c;");
}

/* ── AJAX ── */
add_action('wp_ajax_ns_save_company', function(){
    check_ajax_referer('ns_inv','n');
    update_option('ns_inv_co',wp_unslash($_POST['d']??''));
    if(isset($_POST['l']))update_option('ns_inv_logo',wp_unslash($_POST['l']));
    wp_send_json_success();
});
add_action('wp_ajax_nopriv_ns_save_company', function(){
    check_ajax_referer('ns_inv','n');
    update_option('ns_inv_co',wp_unslash($_POST['d']??''));
    if(isset($_POST['l']))update_option('ns_inv_logo',wp_unslash($_POST['l']));
    wp_send_json_success();
});
add_action('wp_ajax_ns_get_company', function(){
    check_ajax_referer('ns_inv','n');
    wp_send_json_success(['c'=>get_option('ns_inv_co',''),'l'=>get_option('ns_inv_logo','')]);
});
add_action('wp_ajax_nopriv_ns_get_company', function(){
    check_ajax_referer('ns_inv','n');
    wp_send_json_success(['c'=>get_option('ns_inv_co',''),'l'=>get_option('ns_inv_logo','')]);
});
add_action('wp_ajax_ns_save_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $num=sanitize_text_field(wp_unslash($_POST['num']??''));
    $d=wp_unslash($_POST['d']??'');
    if(!$num)wp_send_json_error('No invoice #');
    $ex=$wpdb->get_var($wpdb->prepare("SELECT id FROM $t WHERE invoice_num=%s",$num));
    if($ex)$wpdb->update($t,['invoice_data'=>$d],['invoice_num'=>$num]);
    else $wpdb->insert($t,['invoice_num'=>$num,'invoice_data'=>$d]);
    wp_send_json_success();
});
add_action('wp_ajax_nopriv_ns_save_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $num=sanitize_text_field(wp_unslash($_POST['num']??''));
    $d=wp_unslash($_POST['d']??'');
    if(!$num)wp_send_json_error('No invoice #');
    $ex=$wpdb->get_var($wpdb->prepare("SELECT id FROM $t WHERE invoice_num=%s",$num));
    if($ex)$wpdb->update($t,['invoice_data'=>$d],['invoice_num'=>$num]);
    else $wpdb->insert($t,['invoice_num'=>$num,'invoice_data'=>$d]);
    wp_send_json_success();
});
add_action('wp_ajax_ns_load_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $num=sanitize_text_field(wp_unslash($_POST['num']??''));
    $r=$wpdb->get_row($wpdb->prepare("SELECT * FROM $t WHERE invoice_num=%s",$num));
    if($r)wp_send_json_success(['d'=>$r->invoice_data,'u'=>$r->updated_at]);
    else wp_send_json_error('Not found');
});
add_action('wp_ajax_nopriv_ns_load_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $num=sanitize_text_field(wp_unslash($_POST['num']??''));
    $r=$wpdb->get_row($wpdb->prepare("SELECT * FROM $t WHERE invoice_num=%s",$num));
    if($r)wp_send_json_success(['d'=>$r->invoice_data,'u'=>$r->updated_at]);
    else wp_send_json_error('Not found');
});
add_action('wp_ajax_ns_search_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $q=sanitize_text_field(wp_unslash($_POST['q']??''));
    if(!$q)$rows=$wpdb->get_results("SELECT invoice_num,invoice_data,updated_at FROM $t ORDER BY updated_at DESC LIMIT 20");
    else{$lk='%'.$wpdb->esc_like($q).'%';$rows=$wpdb->get_results($wpdb->prepare("SELECT invoice_num,invoice_data,updated_at FROM $t WHERE invoice_num LIKE %s OR invoice_data LIKE %s ORDER BY updated_at DESC LIMIT 20",$lk,$lk));}
    $out=[];foreach($rows as $r){$cl='';if($r->invoice_data){$j=json_decode($r->invoice_data,true);$cl=$j['cn']??'';}$out[]=['n'=>$r->invoice_num,'c'=>$cl,'u'=>$r->updated_at];}
    wp_send_json_success($out);
});
add_action('wp_ajax_nopriv_ns_search_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$t=$wpdb->prefix.'ns_invoices';
    $q=sanitize_text_field(wp_unslash($_POST['q']??''));
    if(!$q)$rows=$wpdb->get_results("SELECT invoice_num,invoice_data,updated_at FROM $t ORDER BY updated_at DESC LIMIT 20");
    else{$lk='%'.$wpdb->esc_like($q).'%';$rows=$wpdb->get_results($wpdb->prepare("SELECT invoice_num,invoice_data,updated_at FROM $t WHERE invoice_num LIKE %s OR invoice_data LIKE %s ORDER BY updated_at DESC LIMIT 20",$lk,$lk));}
    $out=[];foreach($rows as $r){$cl='';if($r->invoice_data){$j=json_decode($r->invoice_data,true);$cl=$j['cn']??'';}$out[]=['n'=>$r->invoice_num,'c'=>$cl,'u'=>$r->updated_at];}
    wp_send_json_success($out);
});
add_action('wp_ajax_ns_del_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$wpdb->delete($wpdb->prefix.'ns_invoices',['invoice_num'=>sanitize_text_field(wp_unslash($_POST['num']??''))]);
    wp_send_json_success();
});
add_action('wp_ajax_nopriv_ns_del_inv', function(){
    check_ajax_referer('ns_inv','n');
    global $wpdb;$wpdb->delete($wpdb->prefix.'ns_invoices',['invoice_num'=>sanitize_text_field(wp_unslash($_POST['num']??''))]);
    wp_send_json_success();
});

/* ── Shortcode ── */
function northstar_invoice_shortcode(){

    $nonce=wp_create_nonce('ns_inv');
    $ajax=admin_url('admin-ajax.php');
    ob_start();
?>
<style>
.nw{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;max-width:900px!important;margin:0 auto!important;color:#1a1a1a!important}
.nw *{box-sizing:border-box!important}
.nw .nc{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:12px!important;padding:32px!important;margin-bottom:20px!important;box-shadow:0 1px 3px rgba(0,0,0,.06)!important}
.nw .nc h3{margin:0 0 20px!important;font-size:15px!important;font-weight:600!important;color:#00293f!important;text-transform:uppercase!important;letter-spacing:.5px!important}
.nw .nr{display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px!important;margin-bottom:16px!important}
@media(max-width:600px){.nw .nr{grid-template-columns:1fr!important}}
.nw .nf label{display:block!important;font-size:13px!important;font-weight:500!important;color:#64748b!important;margin-bottom:4px!important}
.nw .nf input,.nw .nf textarea{width:100%!important;padding:10px 12px!important;border:1px solid #d1d5db!important;border-radius:8px!important;font-size:14px!important;color:#1a1a1a!important;background:#f8fafc!important}
.nw .nf input:focus,.nw .nf textarea:focus{outline:none!important;border-color:#00293f!important;background:#fff!important}
.nw .nf textarea{resize:vertical!important;min-height:60px!important}
.nw .ntb{display:flex!important;gap:10px!important;align-items:center!important;flex-wrap:wrap!important;margin-bottom:20px!important;padding:16px 20px!important;background:#00293f!important;border-radius:12px!important}
.nw .ntb input[type=text]{flex:1!important;min-width:180px!important;padding:10px 14px!important;border:none!important;border-radius:8px!important;font-size:14px!important;background:rgba(255,255,255,.15)!important;color:#fff!important}
.nw .ntb input::placeholder{color:rgba(255,255,255,.5)!important}
.nw .ntb input:focus{outline:none!important;background:rgba(255,255,255,.25)!important}
.nw .ntbb{padding:10px 18px!important;border:none!important;border-radius:8px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important}
.nw .ntb-ld{background:rgba(255,255,255,.9)!important;color:#00293f!important}.nw .ntb-ld:hover{background:#fff!important}
.nw .ntb-nw{background:rgba(255,255,255,.2)!important;color:#fff!important;border:1px solid rgba(255,255,255,.3)!important}.nw .ntb-nw:hover{background:rgba(255,255,255,.3)!important}
.nw .nsr{position:relative!important}
.nw .nsrd{position:absolute!important;top:100%!important;left:0!important;right:0!important;background:#fff!important;border:1px solid #e2e8f0!important;border-radius:10px!important;box-shadow:0 8px 24px rgba(0,0,0,.12)!important;max-height:300px!important;overflow-y:auto!important;z-index:100!important;display:none;margin-top:6px!important}
.nw .nsri{padding:12px 16px!important;cursor:pointer!important;border-bottom:1px solid #f1f5f9!important;display:flex!important;justify-content:space-between!important;align-items:center!important}.nw .nsri:last-child{border-bottom:none!important}.nw .nsri:hover{background:#e6edf2!important}.nw .nsri strong{color:#00293f!important;font-size:14px!important}.nw .nsri span{color:#94a3b8!important;font-size:12px!important}
.nw .nsre{padding:16px!important;text-align:center!important;color:#94a3b8!important;font-size:13px!important}
.nw .nst{padding:10px 16px!important;border-radius:8px!important;font-size:13px!important;margin-bottom:16px!important;display:none}
.nw .nst-ok{background:#f0fdf4!important;color:#166534!important;border:1px solid #bbf7d0!important;display:block!important}
.nw .nst-err{background:#fef2f2!important;color:#991b1b!important;border:1px solid #fecaca!important;display:block!important}
.nw .nst-info{background:#e6edf2!important;color:#00293f!important;border:1px solid #b0c4d4!important;display:block!important}
.nw .nct{display:flex!important;justify-content:space-between!important;align-items:center!important;cursor:pointer!important}
.nw .ncta{transition:transform .2s!important;font-size:12px!important;color:#94a3b8!important}.nw .ncta.open{transform:rotate(180deg)!important}
.nw .ncs{font-size:13px!important;color:#64748b!important;margin-top:4px!important}.nw .ncs strong{color:#00293f!important}
.nw .ncb{overflow:hidden!important;transition:max-height .3s ease!important}
.nw .nlr{display:flex!important;align-items:center!important;gap:16px!important;margin-bottom:16px!important}
.nw .nlb{width:140px!important;height:70px!important;border:2px dashed #d1d5db!important;border-radius:8px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;cursor:pointer!important;background:#f8fafc!important;flex-shrink:0!important}.nw .nlb:hover{border-color:#00293f!important}.nw .nlb img{max-width:100%!important;max-height:100%!important;object-fit:contain!important}.nw .nlb span{font-size:12px!important;color:#94a3b8!important}
.nw .nli{display:none!important}
.nw .nla{display:flex!important;gap:8px!important;flex-direction:column!important}.nw .nla button{font-size:12px!important;padding:4px 10px!important;border:1px solid #d1d5db!important;border-radius:6px!important;background:#fff!important;cursor:pointer!important;color:#64748b!important}.nw .nla button:hover{border-color:#00293f!important;color:#00293f!important}
.nw table.nit{width:100%!important;border-collapse:collapse!important;margin-bottom:16px!important}.nw .nit th{background:#f1f5f9!important;padding:10px 12px!important;text-align:left!important;font-size:13px!important;font-weight:600!important;color:#475569!important;border-bottom:2px solid #e2e8f0!important}
.nw .nit td{padding:8px 6px!important;vertical-align:middle!important}.nw .nit td input{width:100%!important;padding:8px 10px!important;border:1px solid #d1d5db!important;border-radius:6px!important;font-size:14px!important;background:#f8fafc!important}.nw .nit td input:focus{outline:none!important;border-color:#00293f!important;background:#fff!important}
.nw .nlt{background:#f1f5f9!important;font-weight:600!important;text-align:right!important;padding-right:12px!important;color:#00293f!important}
.nw .nba{width:100%!important;padding:12px!important;background:#f1f5f9!important;color:#334155!important;border:1px dashed #94a3b8!important;border-radius:8px!important;font-size:14px!important;font-weight:600!important;cursor:pointer!important}.nw .nba:hover{background:#e2e8f0!important;border-color:#64748b!important}
.nw .nbd{background:none!important;border:none!important;color:#94a3b8!important;font-size:20px!important;cursor:pointer!important;padding:4px 8px!important;border-radius:4px!important}.nw .nbd:hover{background:#fef2f2!important;color:#dc2626!important}
.nw .nto{display:flex!important;justify-content:flex-end!important;margin-top:16px!important}.nw .ntob{min-width:280px!important}
.nw .ntr{display:flex!important;justify-content:space-between!important;padding:8px 0!important;font-size:14px!important;color:#475569!important;border-bottom:1px solid #f1f5f9!important}
.nw .ntr.ng{font-size:18px!important;font-weight:700!important;color:#00293f!important;border-top:2px solid #00293f!important;border-bottom:none!important;padding-top:12px!important;margin-top:4px!important}
.nw .ntx{display:flex!important;align-items:center!important;gap:8px!important}.nw .ntx input{width:60px!important;padding:4px 8px!important;border:1px solid #d1d5db!important;border-radius:4px!important;font-size:13px!important}.nw .ntx span{color:#64748b!important;font-size:14px!important}
.nw .nac{display:flex!important;gap:12px!important;justify-content:flex-end!important;flex-wrap:wrap!important;margin-top:24px!important}
.nw .nbsv{padding:14px 28px!important;border:2px solid #00293f!important;background:#fff!important;color:#00293f!important;border-radius:10px!important;font-size:15px!important;font-weight:600!important;cursor:pointer!important}.nw .nbsv:hover{background:#e6edf2!important}
.nw .nbpf{padding:14px 32px!important;border:none!important;background:#00293f!important;color:#fff!important;border-radius:10px!important;font-size:15px!important;font-weight:600!important;cursor:pointer!important}.nw .nbpf:hover{background:#003a59!important;transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(0,41,63,.3)!important}
.nw .nbdi{padding:14px 20px!important;border:1px solid #fecaca!important;background:#fff!important;color:#dc2626!important;border-radius:10px!important;font-size:14px!important;font-weight:500!important;cursor:pointer!important}.nw .nbdi:hover{background:#fef2f2!important}
.nw .nbcs{padding:10px 20px!important;border:none!important;background:#00293f!important;color:#fff!important;border-radius:8px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;margin-top:8px!important}.nw .nbcs:hover{background:#003a59!important}
</style>

<div class="nw">
<div class="ntb">
<div class="nsr" style="flex:1;min-width:180px">
<input type="text" id="nsS" placeholder="Search invoice # or client name..." oninput="nsSearch()" onfocus="nsSearch()">
<div class="nsrd" id="nsSd"></div>
</div>
<button class="ntbb ntb-ld" onclick="nsLoadFS()">Load</button>
<button class="ntbb ntb-nw" onclick="nsNew()">+ New Invoice</button>
</div>
<div class="nst" id="nsSt"></div>

<div class="nc">
<div class="nct" onclick="nsTog()"><div><h3 style="margin:0">Company Settings</h3><div class="ncs" id="nsCsum">Loading...</div></div><span class="ncta" id="nsArr">&#9660;</span></div>
<div class="ncb" id="nsCb" style="max-height:0">
<div style="padding-top:20px">
<div class="nlr">
<div class="nlb" id="nsLb" onclick="document.getElementById('nsLi').click()"><span>+ Logo</span></div>
<input type="file" id="nsLi" class="nli" accept="image/*" onchange="nsHL(this)">
<div class="nla"><button onclick="document.getElementById('nsLi').click()">Change Logo</button><button onclick="nsRL()">Remove</button></div>
<div class="nf" style="flex:1"><label>Company Name</label><input type="text" id="nsCN" value="NorthStar Roofing"></div>
</div>
<div class="nr"><div class="nf"><label>Address</label><input type="text" id="nsCA" placeholder="123 Main St, City, State ZIP"></div><div class="nf"><label>Phone</label><input type="text" id="nsCP" placeholder="(555) 555-5555"></div></div>
<div class="nr"><div class="nf"><label>Email</label><input type="text" id="nsCE" placeholder="info@company.com"></div><div class="nf"><label>Website</label><input type="text" id="nsCW" placeholder="www.company.com"></div></div>
<button class="nbcs" onclick="nsSC()">Save Company Info</button>
</div></div></div>

<div class="nc"><h3>Bill To</h3>
<div class="nr"><div class="nf"><label>Client Name</label><input type="text" id="nsBN" placeholder="Client or company name"></div><div class="nf"><label>Client Email</label><input type="text" id="nsBE" placeholder="client@email.com"></div></div>
<div class="nr"><div class="nf"><label>Client Address</label><input type="text" id="nsBA" placeholder="Client address"></div><div class="nf"><label>Client Phone</label><input type="text" id="nsBP" placeholder="(555) 555-5555"></div></div>
</div>

<div class="nc"><h3>Invoice Details</h3>
<div class="nr"><div class="nf"><label>Invoice #</label><input type="text" id="nsIN"></div><div class="nf"><label>Invoice Date</label><input type="date" id="nsID"></div></div>
<div class="nr"><div class="nf"><label>Due Date</label><input type="date" id="nsDD"></div><div class="nf"><label>PO Number (optional)</label><input type="text" id="nsPO"></div></div>
</div>

<div class="nc"><h3>Line Items</h3>
<table class="nit"><thead><tr><th style="width:40%">Description</th><th style="width:12%">Qty</th><th style="width:18%">Rate ($)</th><th style="width:18%">Amount</th><th style="width:12%"></th></tr></thead>
<tbody id="nsLI"><tr><td><input type="text" placeholder="Description..." oninput="nsC()"></td><td><input type="number" value="1" min="0" step="1" oninput="nsC()"></td><td><input type="number" value="0" min="0" step=".01" oninput="nsC()"></td><td class="nlt">$0.00</td><td style="text-align:center"><button class="nbd" onclick="nsRmL(this)">&times;</button></td></tr></tbody></table>
<button class="nba" onclick="nsAL()">+ Add Line Item</button>
<div class="nto"><div class="ntob">
<div class="ntr"><span>Subtotal</span><span id="nsSub">$0.00</span></div>
<div class="ntr"><div class="ntx"><span>Tax</span><input type="number" id="nsTR" value="0" min="0" max="100" step=".1" oninput="nsC()"><span>%</span></div><span id="nsTA">$0.00</span></div>
<div class="ntr ng"><span>Total Due</span><span id="nsGT">$0.00</span></div>
</div></div></div>

<div class="nc"><h3>Notes / Payment Terms</h3><div class="nf"><textarea id="nsNo" placeholder="Payment terms, bank details, etc.">Payment is due within 30 days of invoice date. Thank you for your business!</textarea></div></div>

<div class="nac">
<button class="nbdi" id="nsDel" onclick="nsDI()" style="display:none">Delete Invoice</button>
<button class="nbsv" onclick="nsSI()">&#128190; Save Invoice</button>
<button class="nbpf" onclick="nsPDF()">&#11015; Download PDF</button>
</div>
</div>

<script>
var NS={ajax:'<?php echo esc_url($ajax);?>',nonce:'<?php echo esc_attr($nonce);?>',logo:null};
(function(){nsDts();nsLC()})();

function nsDts(){var t=new Date(),d=new Date();d.setDate(d.getDate()+30);document.getElementById('nsID').value=t.toISOString().split('T')[0];document.getElementById('nsDD').value=d.toISOString().split('T')[0];document.getElementById('nsIN').value='INV-'+t.getFullYear()+String(t.getMonth()+1).padStart(2,'0')+String(t.getDate()).padStart(2,'0')+'-'+String(Math.floor(Math.random()*900)+100)}

function nsMsg(m,t){var e=document.getElementById('nsSt');e.textContent=m;e.className='nst nst-'+t;if(t==='ok')setTimeout(function(){e.style.display='none'},3000)}

var nsO=false;
function nsTog(){nsO=!nsO;var b=document.getElementById('nsCb'),a=document.getElementById('nsArr');if(nsO){b.style.maxHeight=b.scrollHeight+'px';a.classList.add('open')}else{b.style.maxHeight='0';a.classList.remove('open')}}

function nsHL(i){if(i.files&&i.files[0]){var r=new FileReader();r.onload=function(e){NS.logo=e.target.result;document.getElementById('nsLb').innerHTML='<img src="'+NS.logo+'">'};r.readAsDataURL(i.files[0])}}
function nsRL(){NS.logo=null;document.getElementById('nsLb').innerHTML='<span>+ Logo</span>';document.getElementById('nsLi').value=''}

function nsSC(){var d=JSON.stringify({name:document.getElementById('nsCN').value,address:document.getElementById('nsCA').value,phone:document.getElementById('nsCP').value,email:document.getElementById('nsCE').value,website:document.getElementById('nsCW').value});var f=new FormData();f.append('action','ns_save_company');f.append('n',NS.nonce);f.append('d',d);f.append('l',NS.logo||'');fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){if(r.success){nsMsg('Company info saved!','ok');nsUCS()}else nsMsg('Error saving','err')})}

function nsLC(){var f=new FormData();f.append('action','ns_get_company');f.append('n',NS.nonce);fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){if(r.success&&r.data.c){var c=JSON.parse(r.data.c);document.getElementById('nsCN').value=c.name||'';document.getElementById('nsCA').value=c.address||'';document.getElementById('nsCP').value=c.phone||'';document.getElementById('nsCE').value=c.email||'';document.getElementById('nsCW').value=c.website||''}if(r.success&&r.data.l){NS.logo=r.data.l;document.getElementById('nsLb').innerHTML='<img src="'+NS.logo+'">'}nsUCS()})}

function nsUCS(){var n=document.getElementById('nsCN').value,e=document.getElementById('nsCsum');if(n)e.innerHTML='<strong>'+n+'</strong> &mdash; '+(NS.logo?'Logo set &#10003;':'No logo')+' &middot; <span style="color:#94a3b8">Click to edit</span>';else e.innerHTML='<span style="color:#dc2626">Not configured &mdash; click to set up</span>'}

function nsAL(){var tr=document.createElement('tr');tr.innerHTML='<td><input type="text" placeholder="Description..." oninput="nsC()"></td><td><input type="number" value="1" min="0" step="1" oninput="nsC()"></td><td><input type="number" value="0" min="0" step=".01" oninput="nsC()"></td><td class="nlt">$0.00</td><td style="text-align:center"><button class="nbd" onclick="nsRmL(this)">&times;</button></td>';document.getElementById('nsLI').appendChild(tr);nsC()}
function nsRmL(b){var tb=document.getElementById('nsLI');if(tb.rows.length>1){b.closest('tr').remove();nsC()}}

function nsC(){var rows=document.getElementById('nsLI').rows,s=0;for(var i=0;i<rows.length;i++){var inp=rows[i].querySelectorAll('input'),a=(parseFloat(inp[1].value)||0)*(parseFloat(inp[2].value)||0);s+=a;rows[i].querySelector('.nlt').textContent=nsMoney(a)}var tx=parseFloat(document.getElementById('nsTR').value)||0,ta=s*tx/100;document.getElementById('nsSub').textContent=nsMoney(s);document.getElementById('nsTA').textContent=nsMoney(ta);document.getElementById('nsGT').textContent=nsMoney(s+ta)}

function nsGD(){var items=[],rows=document.getElementById('nsLI').rows;for(var i=0;i<rows.length;i++){var inp=rows[i].querySelectorAll('input');items.push({d:inp[0].value,q:inp[1].value,r:inp[2].value})}return{cn:document.getElementById('nsBN').value,ce:document.getElementById('nsBE').value,ca:document.getElementById('nsBA').value,cp:document.getElementById('nsBP').value,in:document.getElementById('nsIN').value,id:document.getElementById('nsID').value,dd:document.getElementById('nsDD').value,po:document.getElementById('nsPO').value,items:items,tx:document.getElementById('nsTR').value,no:document.getElementById('nsNo').value}}

function nsRD(d){document.getElementById('nsBN').value=d.cn||'';document.getElementById('nsBE').value=d.ce||'';document.getElementById('nsBA').value=d.ca||'';document.getElementById('nsBP').value=d.cp||'';document.getElementById('nsIN').value=d.in||'';document.getElementById('nsID').value=d.id||'';document.getElementById('nsDD').value=d.dd||'';document.getElementById('nsPO').value=d.po||'';document.getElementById('nsTR').value=d.tx||'0';document.getElementById('nsNo').value=d.no||'';var tb=document.getElementById('nsLI');tb.innerHTML='';var items=d.items||[{d:'',q:1,r:0}];items.forEach(function(it){var tr=document.createElement('tr');tr.innerHTML='<td><input type="text" value="'+(it.d||'').replace(/"/g,'&quot;')+'" placeholder="Description..." oninput="nsC()"></td><td><input type="number" value="'+(it.q||1)+'" min="0" step="1" oninput="nsC()"></td><td><input type="number" value="'+(it.r||0)+'" min="0" step=".01" oninput="nsC()"></td><td class="nlt">$0.00</td><td style="text-align:center"><button class="nbd" onclick="nsRmL(this)">&times;</button></td>';tb.appendChild(tr)});nsC()}

function nsSI(){var d=nsGD();if(!d.in){nsMsg('Enter an invoice number first','err');return}var f=new FormData();f.append('action','ns_save_inv');f.append('n',NS.nonce);f.append('num',d.in);f.append('d',JSON.stringify(d));fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){if(r.success){nsMsg('Invoice '+d.in+' saved!','ok');document.getElementById('nsDel').style.display=''}else nsMsg('Error: '+(r.data||''),'err')})}

function nsLdI(num){var f=new FormData();f.append('action','ns_load_inv');f.append('n',NS.nonce);f.append('num',num);fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){if(r.success){nsRD(JSON.parse(r.data.d));document.getElementById('nsDel').style.display='';nsMsg('Loaded invoice '+num,'info');nsCD();document.getElementById('nsS').value=''}else nsMsg('Invoice not found','err')})}
function nsLoadFS(){var q=document.getElementById('nsS').value.trim();if(q)nsLdI(q)}

var nsST;
function nsSearch(){clearTimeout(nsST);nsST=setTimeout(function(){var q=document.getElementById('nsS').value.trim(),f=new FormData();f.append('action','ns_search_inv');f.append('n',NS.nonce);f.append('q',q);fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){var dd=document.getElementById('nsSd');if(r.success&&r.data.length>0){dd.innerHTML=r.data.map(function(v){return'<div class="nsri" onclick="nsLdI(\''+v.n.replace(/'/g,"\\'")+'\')">'+'<div><strong>'+v.n+'</strong>'+(v.c?' &mdash; '+v.c:'')+'</div>'+'<span>'+(v.u||'')+'</span></div>'}).join('');dd.style.display='block'}else{dd.innerHTML='<div class="nsre">No invoices found</div>';dd.style.display='block'}})},300)}
function nsCD(){document.getElementById('nsSd').style.display='none'}
document.addEventListener('click',function(e){if(!e.target.closest('.nsr'))nsCD()});

function nsDI(){var num=document.getElementById('nsIN').value;if(!confirm('Delete invoice '+num+'?'))return;var f=new FormData();f.append('action','ns_del_inv');f.append('n',NS.nonce);f.append('num',num);fetch(NS.ajax,{method:'POST',body:f,credentials:'same-origin'}).then(function(r){return r.json()}).then(function(r){if(r.success){nsMsg('Deleted','ok');nsNew()}})}

function nsNew(){document.getElementById('nsDel').style.display='none';nsRD({items:[{d:'',q:1,r:0}],no:'Payment is due within 30 days of invoice date. Thank you for your business!'});nsDts();document.getElementById('nsS').value='';nsMsg('New invoice started','info')}

function nsMoney(v){return'$'+v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function nsFD(v){if(!v)return'';var d=new Date(v+'T00:00:00');return d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

/* ── PDF via print ── ZERO external dependencies ── */
function nsPDF(){
var co={name:document.getElementById('nsCN').value,addr:document.getElementById('nsCA').value,phone:document.getElementById('nsCP').value,email:document.getElementById('nsCE').value,web:document.getElementById('nsCW').value};
var cl={name:document.getElementById('nsBN').value,addr:document.getElementById('nsBA').value,phone:document.getElementById('nsBP').value,email:document.getElementById('nsBE').value};
var inv={num:document.getElementById('nsIN').value,date:nsFD(document.getElementById('nsID').value),due:nsFD(document.getElementById('nsDD').value),po:document.getElementById('nsPO').value};
var rows=document.getElementById('nsLI').rows,items=[],sub=0;
for(var i=0;i<rows.length;i++){var inp=rows[i].querySelectorAll('input');var d=inp[0].value,q=parseFloat(inp[1].value)||0,r=parseFloat(inp[2].value)||0,a=q*r;sub+=a;if(d||a>0)items.push({d:d,q:q,r:r,a:a})}
var txR=parseFloat(document.getElementById('nsTR').value)||0,txA=sub*txR/100,grd=sub+txA;
var notes=document.getElementById('nsNo').value;
var logoHtml=NS.logo?'<img src="'+NS.logo+'" style="max-height:60px;max-width:180px;">':'';
var itemRows=items.map(function(it){return'<tr><td style="padding:10px 12px;border-bottom:1px solid #eee">'+it.d+'</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">'+it.q+'</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">'+nsMoney(it.r)+'</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600">'+nsMoney(it.a)+'</td></tr>'}).join('');

var html='<!DOCTYPE html><html><head><title>Invoice '+inv.num+'</title><style>'
+'@page{size:letter;margin:0.5in}'
+'body{font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;margin:0;padding:40px 50px;font-size:13px;line-height:1.5}'
+'.hdr{border-top:6px solid #00293f;padding-top:24px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}'
+'.hdr-right{text-align:right}'
+'.hdr h1{margin:0;font-size:28px;color:#00293f;letter-spacing:1px}'
+'.meta{color:#64748b;font-size:12px;margin-top:4px}'
+'.cols{display:flex;gap:40px;margin-bottom:30px}'
+'.col{flex:1}'
+'.col-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}'
+'.col-name{font-weight:700;font-size:14px;margin-bottom:4px}'
+'.col-detail{color:#64748b;font-size:12px;line-height:1.6}'
+'table{width:100%;border-collapse:collapse;margin-bottom:20px}'
+'th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px}'
+'th:nth-child(2){text-align:center}th:nth-child(3),th:nth-child(4){text-align:right}'
+'.totals{display:flex;justify-content:flex-end}'
+'.totals-box{min-width:250px}'
+'.tot-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569}'
+'.tot-grand{font-size:18px;font-weight:700;color:#00293f;border-top:2px solid #00293f;padding-top:10px;margin-top:6px}'
+'.notes{margin-top:30px;padding:16px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0}'
+'.notes-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}'
+'.ftr{border-bottom:6px solid #00293f;position:fixed;bottom:0;left:0;right:0}'
+'@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}'
+'</style></head><body>'
+'<div class="hdr"><div>'+logoHtml+'</div><div class="hdr-right"><h1>INVOICE</h1><div class="meta">'+inv.num+'<br>Date: '+inv.date+'<br>Due: '+inv.due+(inv.po?'<br>PO: '+inv.po:'')+'</div></div></div>'
+'<div class="cols"><div class="col"><div class="col-label">From</div><div class="col-name">'+co.name+'</div><div class="col-detail">'
+[co.addr,co.phone,co.email,co.web].filter(Boolean).join('<br>')
+'</div></div><div class="col"><div class="col-label">Bill To</div><div class="col-name">'+cl.name+'</div><div class="col-detail">'
+[cl.addr,cl.phone,cl.email].filter(Boolean).join('<br>')
+'</div></div></div>'
+'<table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>'+itemRows+'</tbody></table>'
+'<div class="totals"><div class="totals-box"><div class="tot-row"><span>Subtotal</span><span>'+nsMoney(sub)+'</span></div>'
+(txR>0?'<div class="tot-row"><span>Tax ('+txR+'%)</span><span>'+nsMoney(txA)+'</span></div>':'')
+'<div class="tot-row tot-grand"><span>Total Due</span><span>'+nsMoney(grd)+'</span></div></div></div>'
+(notes?'<div class="notes"><div class="notes-label">Notes</div>'+notes.replace(/\n/g,'<br>')+'</div>':'')
+'<div class="ftr"></div>'
+'</body></html>';

var f=document.getElementById('nsPrintFrame');
if(!f){f=document.createElement('iframe');f.id='nsPrintFrame';f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:none;';document.body.appendChild(f)}
var fd=f.contentDocument||f.contentWindow.document;
fd.open();fd.write(html);fd.close();
setTimeout(function(){f.contentWindow.focus();f.contentWindow.print()},300);
}
</script>
<?php
    return ob_get_clean();
}
add_shortcode('northstar_invoice', 'northstar_invoice_shortcode');

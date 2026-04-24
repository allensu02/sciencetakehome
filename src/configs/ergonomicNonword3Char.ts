import type { SessionConfig } from '../types';

// Ergonomic 3-character nonwords selected from all lowercase 3-char strings
// after excluding /usr/share/dict/words, first20hours/google-10000-english,
// and a small offensive-string block list. Ranked by the QWERTY effort model.
const ERGONOMIC_NONWORD_3_SOURCE = `
ghg hgh ggh ghh hgg hhg fhg ghf hgj jgh fff ggg hhh jjj ffh fhh ggj gjj hff hhf
jgg jjg fhf gjg hfh jgj dhg ghd hgk kgh dff kjj dgh khg dfh kjg ffj fjj jff jjf
gjf hfj ddf fjg jfh kkj ddd dhh ggk hhd kgg fhd jgk dhf kgj hgy ygh dgg khh dfj
dgj khf kjf gkj hdf ddh gkk hdd kkg ght thg ddg kkh fjf jfj lkj sdf ffd ghs hgl
jjk lgh shg lkk sdd hgu ghk gjk hfd hgd ljj sff djj ffk jjd kff lhg ljg sfh sgh
ggy ygg bhg ghb djg fdf gjd hfk jkj kfh gkg hdh jgy ygj fdd jkk ghr rhg fkj gkh
hdg jdf hht thh ddj fkk jdd kkf lkg llk sdh ssd fht thf dfd dhd kgk kjk ggl hhs
lgg lkh sdg shh ffy ggu ugg yff ghv hgn ngh vhg dfk dgk fhs ggd hhk jgl khd kjd
lgj lll shf sss gyg hfy jgu ugj yfh fdh fhk fjk jfd jgd jkg lhh sgg gyt bhh hhb
ljf llj sfj ssf yty lhf sgj bhf fhb djf fdg fjd fkg gdf gkf hdj hkj jdh jfk jkh
kfj hhr jjt rhh tjj hgi igh gdd hkk yth hty fhr gjt rhf tjg fkh jdg dds kkl ffs
glk hsd jjl lkf sdj hth ihg dfy fyg gyf ghl hgs gjl hfs ygk kgy fyt tyf hgm mgh
hbh bjj ggn hhv jjb ngg vhh ffu uff dsd ffl jjs klk lff sjj ijj ehg ghe bjg ngj
vhf fhv gjb jgn hfu ufh dkj kdf lfh llg sjg ssh gjs gll hfl hss dgy gyy ijg yyg
jfy yfj adf ddk dkk fdj gdh hkg jkf kdd kkd tty tyy ytt yyt ryg gyr dht thd egh
kjt ahg gha ryt tyr uty ytu asd dss gkl glj hds hsf kll llh ssg eff jty ytj chg
ghc ggi igg fkf gdg hkh jdj efh kht tth htt jjr rjj igj jgi ljk sfd dfs dhs dsf
fsd jlk kgl kjl klj lgk shd htu uth rjg gjr fyf gug fjt tjf kgu ugk hbj jbh dhk
djk kfd kgd lkl sds htj jth ihh cgh kjb ydf dfu flk jsd dfl dgl ggs hhl khs kjs
lhd ljd sfk sgk kku dgu ihf uug yyf fyy guu ffn ggm jjv mgg nff vjj bhd dhb ddy
ydd asf dgd djd dkg fhl fjl fss gkd hdk jfs jgs jll kdh kfk khk ygy ehh hhe fyr
ryf gjv hfn jgm mgj nfh vjg cff adh ehf fhe dhr rhd cfh khb bjf fjb jfu ufj dkh
fds fjs fll fsf glg hsh jfl jkl jlj jss kdg lfj llf rrr sjf ssj ttt uuu yyy ijf
hdr hgo ogh ddt adg ahh hha rry ryy ttu tuu utt uut yrr yyr gdj hkf lkd sdk dyg
gyd tkj kjr egj hrr jtt khr rrh ttj chh hhc gng hvh jbj hbn nbh dyt tyd ahf ryr
yry dsh fha fkl flj glh hsg jds jsf klg kkt tkk ffi iff hry jtu utj yrh ghi ojj
yfd chf fhc kkm ohg aff ffa okj sdr efj gku hfi ifh hrh jtj guf ojg sfy dhv kgn
ngk vhd hdy ydh afh hga agh dsg gsd hfa hlk klh jji lgy okk ygl fjr rjf tht kky
dty iug kfy yfk ghw whg bkj dfn kjv cgg ugy ygu fdk jkd eyg gji gye ygd udf bkk
kkb cgj dgn khv fuu uuf ydg eyt ity ldf skj yti sgy drr wdf lku kty ytk ffm mff
ddu udd hge tjk wff hdt ejj jje sdy tuf aas asg dda dkf fkd fsh iuu jdk jlg kdj
ddl gss hll kks ldd skk dth kug iyg rdf fdr ffe sht ths wdd wgh hfm mfh wfh ljt
dyf fyd hbk kbh ejg gje fjv jfn nfj vjf kyg drh bng gnb jbn nbj igk kgi adj ery
iut ety iyt rdd hfe ith thk hti gkt tkg ghx xhg htk kth ggo ogg djt erh kyt tjd
gkm cfj ddv kkn flg glf hsj jsh fsg gds gsf hkl hlj jlh jdr kuu lht ogj dfi jgo
sdt gnf hvj fng jvh rkj bbh hbb dgi dyy yyd aad ajj dfa dlk jja ksd lgl ljl rru
ruu sfs shs ssa urr uur iij okg sse bht thb eth jku kut ukj jrr rrj tkh jjc cjj
gky hhi ihd lgu ugl kkr rkk xgh hbm mbh bjk hgc xff dyr fdy ohh ryd ufd ajg djl
dsj flh gja iiu jsg kfs klf lfd lgd shk sjk ury yru dhl kgs ijk kji ukk jry yrj
lkt cjg gjc ugu yfy urh hru eyf fhi ugd fye gkb kgm bkg mgk xdf lkm xfh ljb fuf
ohf sfu gga agg eee lhs ljs sfl sgl rht thr hrj jrh gij okh fku dhe ehd hdu ifj
jfi udh ssr dtt ojf sgu hhw whh bhs xdd ffc shb bjd djb giu iuf jdy kfu ufk ydj
afj agj dgs djs hda jfa jga kfl khl lfk lhk lld sgd sjd ssk dll gks hdl kss ldh
skg ngy ygn ijd lli eef wdh dfm ndf vkj fgh ghj hgf jhg lky dtu fdt iyf tdf jbk
kbj fhw whf kje dgm bkh bhk hfc gii iig asj bnb eyy gdk hkd itt nbn tti yye fji
rdh dfe efd khe ktt ttk ddn kkv ndd vkk udg dtj kyf egk gge rhs shr tdd lkb lhb
gkn hdv ahd dkl eyr itu kds uti dlj ksf ldg skh kuf wdg jkt ktu rjk utk wgg ysd
sdu syg gys itj rhk jge jti jdt bnf dhc fnb chd bhb jkm mkj bbj gnn hvv jbb nng
vvh ruf fas ett fsj gsh hlg iyy jlf lks sda sdl jtk ktj gdr rdg tij dru thv vht
efk wgj ljr drj hhx jfm xhh mfj syt tys llu kyy lhr wfj jjo iih ejf fje gkr rkg
`.trim();

export const ERGONOMIC_NONWORD_3_STRINGS = ERGONOMIC_NONWORD_3_SOURCE.split(/\s+/);

export const ergonomicNonword3CharConfig: SessionConfig = {
  condition_id: 'three_char_ergonomic_nonwords_n1000',
  alphabet: [...ERGONOMIC_NONWORD_3_STRINGS],
  input_modality: 'keyboard',
  scoring: {
    mode: 'exact_match',
    advance_on_error: true
  },
  display: {
    show_current_target: true,
    show_next_target: false,
    show_keyboard_overlay: false,
    require_space: true
  },
  duration_seconds: 60,
  familiarization_seconds: 20
};

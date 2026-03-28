echo boundary fitting

echo boundary fitting: 00_format_target
# .sh がある場合は bash、.py がある場合は python で実行
python 3_fitting/00_format_target.py 2>/dev/null || bash 3_fitting/00_format_target.sh

echo boundary fitting: 01_format_src
python 3_fitting/01_format_src.py 2>/dev/null || bash 3_fitting/01_format_src.sh

echo boundary fitting: 10_boundary_fitting
python 3_fitting/10_boundary_fitting.py 2>/dev/null || bash 3_fitting/10_boundary_fitting.sh

echo boundary fitting: 11_get_landmark_indices_all
python 3_fitting/11_get_landmark_indices_all.py 2>/dev/null || bash 3_fitting/11_get_landmark_indices_all.sh

echo fitting

echo fitting: 20_opt_occ_all
python 3_fitting/nicp/20_demo_nicp_cloth_occ_all.py

echo fitting: 21_refine
python 3_fitting/21_find_knn_all.py 2>/dev/null || python 3_fitting/21_refine.py 2>/dev/null
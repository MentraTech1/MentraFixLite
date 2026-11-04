// المسار: components/Settings/SettingsStaffTab.js
window.SettingsStaffTab = function({ isLoading, currentStaff, searchQuery, setSearchQuery, openAddModal, openEditModal, toggleStaffStatus, userId, roleDetails, currentPage, totalPages, prevPage, nextPage }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[400px] animate-view">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-t-3xl">
                <h3 className="font-black text-slate-800 text-base flex items-center gap-2 shrink-0"><i className="fas fa-user-shield text-slate-400"></i> الحسابات المسجلة</h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input type="text" placeholder="بحث بالاسم أو الرقم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-[#06B6D4] shadow-sm transition-all" />
                        <i className="fas fa-search absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 text-sm"></i>
                    </div>
                    <button onClick={openAddModal} className="w-full sm:w-auto bg-gradient-to-l from-[#06B6D4] to-[#3B82F6] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform shrink-0"><i className="fas fa-user-plus"></i> موظف جديد</button>
                </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                {isLoading ? (
                    <div className="flex justify-center items-center py-10"><i className="fas fa-circle-notch fa-spin text-3xl text-[#06B6D4]"></i></div>
                ) : currentStaff.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentStaff.map((user) => (
                            <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#06B6D4] transition-colors flex flex-col relative overflow-hidden group shadow-sm">
                                {user.id === parseInt(userId) && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm">حسابك الحالي</div>}
                                <div className="flex items-center gap-4 mb-4 mt-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${user.is_active ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>{user.name.charAt(0)}</div>
                                    <div className="overflow-hidden flex-1">
                                        <h4 className={`font-black text-base truncate ${user.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{user.name}</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-0.5 truncate" dir="ltr"><i className="fas fa-phone text-slate-300 mr-1"></i> {user.phone}</p>
                                    </div>
                                    <button onClick={() => openEditModal(user)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-[#06B6D4] hover:text-white transition-colors shrink-0 border border-slate-100"><i className="fas fa-pen text-xs"></i></button>
                                </div>
                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${roleDetails[user.role]?.color || 'bg-slate-50 text-slate-600'}`}>{roleDetails[user.role]?.name || user.role}</span>
                                    <button onClick={() => toggleStaffStatus(user)} disabled={user.id === parseInt(userId)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}>{user.is_active ? 'إيقاف' : 'تفعيل'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 text-slate-400">
                        <i className="fas fa-users-slash text-4xl mb-3 opacity-50"></i><p className="text-sm font-bold text-center">لا يوجد موظفين مطابقين للبحث</p>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">صفحة {currentPage} من {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={prevPage} disabled={currentPage === 1} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center hover:bg-[#06B6D4] hover:text-white disabled:opacity-50 transition-colors shadow-sm"><i className="fas fa-chevron-right text-sm"></i></button>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center hover:bg-[#06B6D4] hover:text-white disabled:opacity-50 transition-colors shadow-sm"><i className="fas fa-chevron-left text-sm"></i></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};